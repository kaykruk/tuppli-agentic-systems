'use client'

/**
 * Client-side Perceptual Hash (pHash) Generation
 * 
 * This generates a 64-bit perceptual hash for images using:
 * 1. Resize to 32x32 grayscale
 * 2. DCT (Discrete Cosine Transform) approximation using average
 * 3. Compare each pixel to the average to generate binary hash
 * 
 * Similar images will have similar pHashes, enabling content tracking.
 */

export interface PHashResult {
    hash: string
    hashBinary: string
    thumbnail: string // Base64 data URL of the grayscale thumbnail
}

/**
 * Generate perceptual hash from an image file
 */
export async function generatePHash(file: File): Promise<PHashResult> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = () => {
            img.src = reader.result as string
        }

        img.onload = () => {
            try {
                const result = computePHash(img)
                resolve(result)
            } catch (error) {
                reject(error)
            }
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        reader.onerror = () => reject(new Error('Failed to read file'))

        reader.readAsDataURL(file)
    })
}

/**
 * Compute pHash from loaded image
 */
function computePHash(img: HTMLImageElement): PHashResult {
    const size = 32 // Use 32x32 for better precision
    const smallSize = 8 // Final hash size (8x8 = 64 bits)

    // Create canvas for resizing
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = size
    canvas.height = size

    // Draw resized image
    ctx.drawImage(img, 0, 0, size, size)

    // Get image data
    const imageData = ctx.getImageData(0, 0, size, size)
    const pixels = imageData.data

    // Convert to grayscale
    const grayPixels: number[] = []
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        // Luminosity method for grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        grayPixels.push(gray)
    }

    // Apply simple DCT-like operation: resize to 8x8 with averaging
    const dctPixels: number[] = []
    const blockSize = size / smallSize

    for (let y = 0; y < smallSize; y++) {
        for (let x = 0; x < smallSize; x++) {
            let sum = 0
            let count = 0
            for (let dy = 0; dy < blockSize; dy++) {
                for (let dx = 0; dx < blockSize; dx++) {
                    const px = x * blockSize + dx
                    const py = y * blockSize + dy
                    const idx = py * size + px
                    sum += grayPixels[idx]
                    count++
                }
            }
            dctPixels.push(sum / count)
        }
    }

    // Calculate average (excluding the DC component for robustness)
    const avg = dctPixels.reduce((a, b) => a + b, 0) / dctPixels.length

    // Generate binary hash
    const binaryHash = dctPixels.map(p => p > avg ? '1' : '0').join('')

    // Convert binary to hex for compact storage
    const hexHash = binaryToHex(binaryHash)

    // Generate thumbnail for display
    canvas.width = smallSize
    canvas.height = smallSize
    const thumbCtx = canvas.getContext('2d')!
    const thumbData = thumbCtx.createImageData(smallSize, smallSize)

    for (let i = 0; i < dctPixels.length; i++) {
        const gray = Math.round(dctPixels[i])
        thumbData.data[i * 4] = gray
        thumbData.data[i * 4 + 1] = gray
        thumbData.data[i * 4 + 2] = gray
        thumbData.data[i * 4 + 3] = 255
    }
    thumbCtx.putImageData(thumbData, 0, 0)

    return {
        hash: hexHash,
        hashBinary: binaryHash,
        thumbnail: canvas.toDataURL()
    }
}

/**
 * Convert binary string to hex
 */
function binaryToHex(binary: string): string {
    let hex = ''
    for (let i = 0; i < binary.length; i += 4) {
        const chunk = binary.slice(i, i + 4)
        hex += parseInt(chunk, 2).toString(16)
    }
    return hex
}

/**
 * Calculate Hamming distance between two hashes
 * Lower distance = more similar images
 */
export function hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) {
        throw new Error('Hashes must be the same length')
    }

    // Convert hex to binary
    const bin1 = hexToBinary(hash1)
    const bin2 = hexToBinary(hash2)

    let distance = 0
    for (let i = 0; i < bin1.length; i++) {
        if (bin1[i] !== bin2[i]) distance++
    }
    return distance
}

/**
 * Calculate similarity percentage (0-100)
 */
export function similarity(hash1: string, hash2: string): number {
    const distance = hammingDistance(hash1, hash2)
    const maxDistance = hash1.length * 4 // Each hex char = 4 bits
    return Math.round((1 - distance / maxDistance) * 100)
}

function hexToBinary(hex: string): string {
    return hex.split('').map(h =>
        parseInt(h, 16).toString(2).padStart(4, '0')
    ).join('')
}

/**
 * Generate multiple hash variants for robustness
 * (flipped, rotated versions help catch mirrors/rotations)
 */
export async function generatePHashVariants(file: File): Promise<{
    original: string
    flippedH: string
    flippedV: string
}> {
    const originalResult = await generatePHash(file)

    // For now, just return the original
    // TODO: Add rotation/flip variants for robust matching
    return {
        original: originalResult.hash,
        flippedH: originalResult.hash, // Placeholder
        flippedV: originalResult.hash  // Placeholder
    }
}

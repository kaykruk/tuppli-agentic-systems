# Entity: Watermark Service

The **Watermark Service** provides the forensic backbone for Tuppli, enabling the tracing of leaked media back to a specific viewer.

## Technical Details
- **Stack**: Node.js, Express, `sharp`, `reedsolomon`, `ffmpeg`.
- **Port**: 4001 (default)

## Capabilities
### 1. Image Watermarking
- Uses **LSB (Least Significant Bit) steganography** on pixel data.
- Employs **Reed-Solomon Error Correction** (15 parity bytes) to survive image compression.
- Transparently embeds a 32-byte fingerprint into Blue and Red channels for redundancy.

### 2. Video Watermarking
- Extracts the first **I-Frame (Keyframe)** using `ffmpeg`.
- Embeds the watermark into the frame using the image pipeline.
- Overlays the watermarked frame back into the video stream.

## Role in Tuppli
When a creator uploads media, this service embeds a unique `viewer_id`. If that media later appears on a leak site, the `/extract` endpoint can identify exactly which user leaked it (Traitor Tracing).

---
*Concepts:*
- [[Forensic-Watermarking]]

*Source:*
- [watermark_service/index.js](../../watermark_service/index.js)

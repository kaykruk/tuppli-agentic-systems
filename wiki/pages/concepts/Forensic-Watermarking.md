# Concept: Forensic Watermarking

**Forensic Watermarking** is the process of embedding invisible, unique identifiers into digital media to deter piracy and enable "traitor tracing."

## How it works in Tuppli
Unlike visible watermarks (logos), forensic watermarks are hidden within the bits of the file. 

1. **Embedding**: A unique viewer ID is hashed and injected into the Least Significant Bits (LSB) of an image or video frame.
2. **Robustness**: Tuppli uses **Reed-Solomon** error correction, allowing the watermark to be recovered even if the image is slightly compressed or resized.
3. **Extraction**: If a leak is found, the system downloads the file and reverses the process to recover the original ID.

## Importance
It moves enforcement from "generic takedowns" to "personal accountability." Knowing that a file can be traced back to them significantly reduces the likelihood of a user leaking content.

---
*Related Entities:*
- [[Watermark-Service]]

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNGBuffer(width, height) {
  // Create raw RGBA image data
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate radius from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = width * 0.42;

      // Dark movie theme background (#090a0f)
      let r = 9;
      let g = 10;
      let b = 15;
      let a = 255;

      // Outer play badge circle with green glow (#00df82)
      if (dist < maxR && dist > maxR - (width * 0.03)) {
        r = 0; g = 223; b = 130; // Emerald accent
      } else if (dist <= maxR - (width * 0.03)) {
        // Inner badge background (#121422)
        r = 18; g = 20; b = 34;

        // Play triangle inside center
        const triWidth = width * 0.22;
        const triHeight = height * 0.26;
        const leftX = cx - triWidth * 0.35;
        const rightX = cx + triWidth * 0.65;
        const topY = cy - triHeight / 2;
        const bottomY = cy + triHeight / 2;

        if (x >= leftX && x <= rightX) {
          const progress = (x - leftX) / (rightX - leftX);
          const currentTopY = cy - (triHeight / 2) * (1 - progress);
          const currentBottomY = cy + (triHeight / 2) * (1 - progress);
          if (y >= currentTopY && y <= currentBottomY) {
            r = 0; g = 223; b = 130;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress IDAT chunk using zlib
  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([139, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);
  const ihdrType = Buffer.from('IHDR');
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);

  // IDAT chunk
  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressedData.length, 0);
  const idatType = Buffer.from('IDAT');
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, compressedData])), 0);

  // IEND chunk
  const iendLength = Buffer.alloc(4);
  iendLength.writeUInt32BE(0, 0);
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);

  return Buffer.concat([
    signature,
    ihdrLength, ihdrType, ihdrData, ihdrCrc,
    idatLength, idatType, compressedData, idatCrc,
    iendLength, iendType, iendCrc
  ]);
}

// Minimal CRC32 implementation for PNG chunks
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating 192x192 PNG icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNGBuffer(192, 192));

console.log('Generating 512x512 PNG icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNGBuffer(512, 512));

console.log('Generating 512x512 Maskable PNG icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNGBuffer(512, 512));

console.log('Generating Apple Touch PNG icon...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNGBuffer(180, 180));

console.log('PWA icons successfully generated in public directory!');

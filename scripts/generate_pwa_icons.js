import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createFreeMoviePNGBuffer(width, height) {
  // Create raw RGBA image data
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      const nx = x / width;
      const ny = y / height;

      // Base: White Card (#FFFFFF)
      let r = 255;
      let g = 255;
      let b = 255;
      let a = 255;

      // Bottom blue wave curve
      const waveThreshold = 0.65 + Math.sin(nx * Math.PI) * 0.05;
      const greenThreshold = waveThreshold - 0.04;

      if (ny >= waveThreshold) {
        // Deep vibrant blue gradient
        const t = (ny - waveThreshold) / (1 - waveThreshold);
        r = Math.round(0 * (1 - t) + 2 * t);
        g = Math.round(180 * (1 - t) + 62 * t);
        b = Math.round(216 * (1 - t) + 138 * t);
      } else if (ny >= greenThreshold) {
        // Soft green wave accent
        r = 128;
        g = 237;
        b = 153;
      }

      // Center Play & Download Logo
      const cx = 0.5;
      const cy = 0.38;
      const triLeft = 0.32;
      const triRight = 0.72;
      const triTop = cy - 0.20;
      const triBottom = cy + 0.20;

      // Check if inside play triangle
      if (nx >= triLeft && nx <= triRight) {
        const progress = (nx - triLeft) / (triRight - triLeft);
        const curTop = cy - (0.20 * (1 - progress));
        const curBottom = cy + (0.20 * (1 - progress));

        if (ny >= curTop && ny <= curBottom) {
          // Play button gradient (Cyan to Blue)
          r = Math.round(0 * (1 - progress) + 42 * progress);
          g = Math.round(245 * (1 - progress) + 111 * progress);
          b = Math.round(212 * (1 - progress) + 219 * progress);

          // Left film strip perforated border
          if (nx <= triLeft + 0.10) {
            r = 0; g = 187; b = 249;
            // Dots
            const dotY = (ny - curTop) / (curBottom - curTop);
            if (dotY > 0.15 && dotY < 0.25 && nx > triLeft + 0.03 && nx < triLeft + 0.07) {
              r = 0; g = 53; b = 102;
            } else if (dotY > 0.45 && dotY < 0.55 && nx > triLeft + 0.03 && nx < triLeft + 0.07) {
              r = 0; g = 53; b = 102;
            } else if (dotY > 0.75 && dotY < 0.85 && nx > triLeft + 0.03 && nx < triLeft + 0.07) {
              r = 0; g = 53; b = 102;
            }
          }

          // Green download arrow in center
          const arrowWidth = 0.12;
          const arrowHeadWidth = 0.22;
          const arrowTop = cy - 0.12;
          const arrowMid = cy + 0.02;
          const arrowBottom = cy + 0.14;

          if (nx >= cx - arrowWidth / 2 && nx <= cx + arrowWidth / 2 && ny >= arrowTop && ny <= arrowMid) {
            // Arrow stem (Green #52B788)
            r = 82; g = 183; b = 136;
          } else if (ny >= arrowMid && ny <= arrowBottom) {
            const arrProgress = (ny - arrowMid) / (arrowBottom - arrowMid);
            const span = (arrowHeadWidth / 2) * (1 - arrProgress);
            if (nx >= cx - span && nx <= cx + span) {
              // Arrow head (Vibrant Green #74C69D)
              r = 116; g = 198; b = 157;
            }
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

console.log('Generating 192x192 PNG Free Movie icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createFreeMoviePNGBuffer(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon.png'), createFreeMoviePNGBuffer(192, 192));

console.log('Generating 512x512 PNG Free Movie icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createFreeMoviePNGBuffer(512, 512));

console.log('Generating 512x512 Maskable Free Movie icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createFreeMoviePNGBuffer(512, 512));

console.log('Generating Apple Touch Free Movie icon...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createFreeMoviePNGBuffer(180, 180));

// Also copy to flutter_app/assets/icon.png if directory exists
const flutterAssetsDir = path.resolve('flutter_app', 'assets');
if (fs.existsSync(flutterAssetsDir)) {
  fs.writeFileSync(path.join(flutterAssetsDir, 'icon.png'), createFreeMoviePNGBuffer(192, 192));
}

console.log('Free Movie app icons successfully generated!');

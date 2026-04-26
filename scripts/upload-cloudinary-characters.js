/**
 * Upload character placeholder images to Cloudinary with tags.
 * Run: node scripts/upload-cloudinary-characters.js
 */
require('dotenv').config({ override: true });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CHARACTERS = [
  {
    tag: 'spongebob',
    name: 'SpongeBob',
    colors: { bg: '#FFE135', body: '#FFD700', eyes: '#fff', outline: '#8B6914', pants: '#8B4513' },
    variants: ['happy', 'teaching', 'cooking'],
  },
  {
    tag: 'bluey',
    name: 'Bluey',
    colors: { bg: '#5B9BD5', body: '#4A86C8', eyes: '#fff', outline: '#2C5F8A', pants: '#A8D8EA' },
    variants: ['happy', 'playing', 'sharing'],
  },
  {
    tag: 'pawpatrol',
    name: 'Paw Patrol',
    colors: { bg: '#1E88E5', body: '#D32F2F', eyes: '#fff', outline: '#0D47A1', pants: '#FFC107' },
    variants: ['chase', 'marshall', 'team'],
  },
  {
    tag: 'minecraft',
    name: 'Minecraft Steve',
    colors: { bg: '#8BC34A', body: '#5D4037', eyes: '#fff', outline: '#3E2723', pants: '#1565C0' },
    variants: ['building', 'crafting', 'exploring'],
  },
  {
    tag: 'encanto',
    name: 'Mirabel (Encanto)',
    colors: { bg: '#AB47BC', body: '#7B1FA2', eyes: '#fff', outline: '#4A148C', pants: '#E1BEE7' },
    variants: ['mirabel', 'casita', 'magic'],
  },
];

function buildCharacterSvg(char, variant, index) {
  const c = char.colors;
  const w = 800, h = 800;
  const label = `${char.name} - ${variant}`;

  // Different poses/expressions per variant
  const faceVariants = {
    0: { mouth: 'M 340 520 Q 400 580 460 520', eyeSize: 35 }, // smile
    1: { mouth: 'M 330 510 Q 400 560 470 510', eyeSize: 30 }, // grin
    2: { mouth: 'M 350 530 Q 400 570 450 530', eyeSize: 40 }, // wide eyes
  };
  const face = faceVariants[index] || faceVariants[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad${index}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${c.bg}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${c.bg}"/>
    </radialGradient>
    <filter id="shadow${index}">
      <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="#00000033"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bgGrad${index})" rx="40"/>
  <rect x="20" y="20" width="${w-40}" height="${h-40}" rx="30" fill="none" stroke="${c.outline}" stroke-width="4" stroke-dasharray="12 6"/>

  <!-- Character body -->
  <g filter="url(#shadow${index})">
    <!-- Body -->
    <rect x="280" y="280" width="240" height="260" rx="30" fill="${c.body}" stroke="${c.outline}" stroke-width="4"/>

    <!-- Head -->
    <circle cx="400" cy="240" r="120" fill="${c.body}" stroke="${c.outline}" stroke-width="4"/>

    <!-- Eyes -->
    <circle cx="360" cy="220" r="${face.eyeSize}" fill="${c.eyes}" stroke="${c.outline}" stroke-width="2"/>
    <circle cx="440" cy="220" r="${face.eyeSize}" fill="${c.eyes}" stroke="${c.outline}" stroke-width="2"/>
    <circle cx="365" cy="225" r="12" fill="#333"/>
    <circle cx="445" cy="225" r="12" fill="#333"/>
    <circle cx="370" cy="218" r="5" fill="#fff"/>
    <circle cx="450" cy="218" r="5" fill="#fff"/>

    <!-- Mouth -->
    <path d="${face.mouth}" fill="none" stroke="${c.outline}" stroke-width="4" stroke-linecap="round"/>

    <!-- Arms -->
    <rect x="200" y="320" width="80" height="30" rx="15" fill="${c.body}" stroke="${c.outline}" stroke-width="3" transform="rotate(-20 240 335)"/>
    <rect x="520" y="320" width="80" height="30" rx="15" fill="${c.body}" stroke="${c.outline}" stroke-width="3" transform="rotate(20 560 335)"/>

    <!-- Legs/pants -->
    <rect x="310" y="530" width="70" height="100" rx="15" fill="${c.pants}" stroke="${c.outline}" stroke-width="3"/>
    <rect x="420" y="530" width="70" height="100" rx="15" fill="${c.pants}" stroke="${c.outline}" stroke-width="3"/>

    <!-- Feet -->
    <ellipse cx="345" cy="640" rx="40" ry="18" fill="${c.outline}"/>
    <ellipse cx="455" cy="640" rx="40" ry="18" fill="${c.outline}"/>
  </g>

  <!-- Name banner -->
  <rect x="150" y="680" width="500" height="60" rx="14" fill="${c.outline}" opacity="0.85"/>
  <text x="400" y="720" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold" font-family="Comic Sans MS, cursive">${label}</text>

  <!-- Decorative stars -->
  <text x="100" y="100" font-size="40" opacity="0.5">⭐</text>
  <text x="650" y="150" font-size="32" opacity="0.4">✨</text>
  <text x="120" y="650" font-size="28" opacity="0.3">🌟</text>
  <text x="680" y="600" font-size="36" opacity="0.4">⭐</text>
</svg>`;
}

async function uploadAll() {
  console.log('Uploading character images to Cloudinary...\n');

  for (const char of CHARACTERS) {
    console.log(`--- ${char.name} (tag: ${char.tag}) ---`);
    for (let i = 0; i < char.variants.length; i++) {
      const variant = char.variants[i];
      const svg = buildCharacterSvg(char, variant, i);
      const buffer = Buffer.from(svg, 'utf8');
      const publicId = `spectra/characters/${char.tag}/${variant}`;

      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: 'image',
              overwrite: true,
              format: 'png',
              tags: [char.tag, 'spectra', 'character'],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
        console.log(`  [OK] ${variant}: ${result.secure_url}`);
      } catch (err) {
        console.error(`  [FAIL] ${variant}: ${err.message}`);
      }
    }
    console.log('');
  }

  // Verify tags
  console.log('--- Verifying tags ---');
  try {
    const tags = await cloudinary.api.tags({ max_results: 50 });
    console.log('Tags found:', tags.tags.join(', '));
  } catch (e) {
    console.error('Tag verification failed:', e.message);
  }

  // Show images per tag
  for (const char of CHARACTERS) {
    try {
      const result = await cloudinary.api.resources_by_tag(char.tag, { max_results: 10, resource_type: 'image' });
      console.log(`\n${char.tag}: ${result.resources.length} images`);
      result.resources.forEach(r => console.log(`  ${r.secure_url}`));
    } catch (e) {
      console.log(`${char.tag}: failed - ${e.message}`);
    }
  }
}

uploadAll().catch(console.error);

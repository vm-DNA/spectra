/**
 * Delete placeholder images and upload real SpongeBob PNGs to Cloudinary.
 * Run: node scripts/replace-cloudinary-spongebob.js
 */
require('dotenv').config({ override: true });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ATTACHMENTS_DIR = '/home/ubuntu/attachments';

async function run() {
  // Step 1: Delete ALL old placeholder images
  console.log('--- Deleting old placeholder images ---');
  const oldPublicIds = [
    'spectra/characters/spongebob/happy',
    'spectra/characters/spongebob/teaching',
    'spectra/characters/spongebob/cooking',
    'spectra/characters/bluey/happy',
    'spectra/characters/bluey/playing',
    'spectra/characters/bluey/sharing',
    'spectra/characters/pawpatrol/chase',
    'spectra/characters/pawpatrol/marshall',
    'spectra/characters/pawpatrol/team',
    'spectra/characters/minecraft/building',
    'spectra/characters/minecraft/crafting',
    'spectra/characters/minecraft/exploring',
    'spectra/characters/encanto/mirabel',
    'spectra/characters/encanto/casita',
    'spectra/characters/encanto/magic',
  ];

  try {
    const delResult = await cloudinary.api.delete_resources(oldPublicIds);
    console.log('Deleted:', Object.keys(delResult.deleted).length, 'images');
  } catch (e) {
    console.log('Delete failed (may not exist):', e.message);
  }

  // Step 2: Find the user's SpongeBob images
  const imageFiles = [];
  const dirs = fs.readdirSync(ATTACHMENTS_DIR);
  for (const d of dirs) {
    const dirPath = path.join(ATTACHMENTS_DIR, d);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const files = fs.readdirSync(dirPath);
    for (const f of files) {
      if (f.match(/\.(png|jpg|jpeg)$/i)) {
        imageFiles.push({ path: path.join(dirPath, f), name: f });
      }
    }
  }

  // Map filenames to descriptive names (files may have + instead of spaces)
  const nameMap = {
    'Screenshot+2026-04-26+at+12.50.25AM.png': { publicId: 'spectra/spongebob/spongebob-happy', label: 'SpongeBob Happy' },
    'Screenshot+2026-04-26+at+12.50.53AM.png': { publicId: 'spectra/spongebob/mrkrabs-money', label: 'Mr. Krabs with Money' },
    'Screenshot+2026-04-26+at+12.51.05AM.png': { publicId: 'spectra/spongebob/krabby-patty', label: 'Krabby Patty' },
    'Screenshot+2026-04-26+at+12.51.17AM.png': { publicId: 'spectra/spongebob/mrkrabs', label: 'Mr. Krabs' },
    'Screenshot+2026-04-26+at+12.51.27AM.png': { publicId: 'spectra/spongebob/patricks-rock', label: "Patrick's Rock" },
    'Screenshot+2026-04-26+at+12.51.37AM.png': { publicId: 'spectra/spongebob/patrick', label: 'Patrick Star' },
  };

  console.log('\n--- Uploading SpongeBob images ---');
  console.log('Found', imageFiles.length, 'image files');

  const uploadedUrls = [];

  for (const img of imageFiles) {
    const mapping = nameMap[img.name];
    const publicId = mapping ? mapping.publicId : `spectra/spongebob/${img.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '_')}`;
    const label = mapping ? mapping.label : img.name;

    try {
      const result = await cloudinary.uploader.upload(img.path, {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        tags: ['spongebob', 'spectra', 'character'],
      });
      console.log(`  [OK] ${label}: ${result.secure_url}`);
      uploadedUrls.push({ label, url: result.secure_url, publicId });
    } catch (err) {
      console.error(`  [FAIL] ${label}: ${err.message}`);
    }
  }

  // Step 3: Verify
  console.log('\n--- Verifying spongebob tag ---');
  try {
    const result = await cloudinary.api.resources_by_tag('spongebob', { max_results: 20, resource_type: 'image' });
    console.log(`spongebob: ${result.resources.length} images`);
    result.resources.forEach(r => console.log(`  ${r.public_id}: ${r.secure_url}`));
  } catch (e) {
    console.log('Verify failed:', e.message);
  }

  // Output URL mapping for updating demoData.js
  console.log('\n--- URLs for demoData.js ---');
  uploadedUrls.forEach(u => console.log(`${u.label}: ${u.url}`));
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');

const seedFile = fs.readFileSync(path.join(__dirname, 'backend/prisma/seed.ts'), 'utf-8');

// Extract URLs using regex
const urlRegex = /url:\s*'([^']+)'/g;
const urls = [];
let match;
while ((match = urlRegex.exec(seedFile)) !== null) {
  urls.push(match[1]);
}

console.log(`Found ${urls.length} image URLs to check...`);

async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.log(`BROKEN: ${url} (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`ERROR checking ${url}: ${e.message}`);
    }
  }
  console.log("Check complete.");
}

checkUrls();

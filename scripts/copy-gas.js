import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.resolve(__dirname, '../gas-dist/index.html');
const target = path.resolve(__dirname, '../gas/index.html');

try {
  if (fs.existsSync(source)) {
    let content = fs.readFileSync(source, 'utf8');

    // Clean up CSS linter compatibility issues in inlined styles:
    // 1. Remove vertical-align when element has display:block
    content = content.replace(
      'img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}',
      'img,svg,video,canvas,audio,iframe,embed,object{display:block}'
    );

    // 2. Add standard line-clamp property alongside -webkit-line-clamp
    content = content.replace(
      /(-webkit-line-clamp:(\d+);)(?!line-clamp)/g,
      '$1line-clamp:$2;'
    );

    fs.writeFileSync(target, content, 'utf8');
    console.log('✓ Successfully processed and copied single-file bundle to gas/index.html');
  } else {
    console.error('Source gas-dist/index.html not found.');
  }
} catch (err) {
  console.error('Failed to copy gas bundle:', err);
}

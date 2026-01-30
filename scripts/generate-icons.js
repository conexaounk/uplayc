const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const sizes = [192, 512, 180];

Promise.all(sizes.map(size => 
  sharp(path.join(publicDir, 'mascot-original.webp'))
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, `icon-${size}x${size}.png`))
)).then(() => {
  console.log('Ícones criados com sucesso!');
  return sharp(path.join(publicDir, 'mascot-original.webp'))
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
}).then(() => {
  console.log('Favicon criado!');
}).catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});

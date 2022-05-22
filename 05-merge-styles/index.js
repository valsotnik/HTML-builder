const fs = require('fs');
const path = require('path');
const stylesDir = path.join(__dirname, 'styles');


(async () => {
  let styles = await fs.promises.readdir(stylesDir, { withFileTypes: true });
  const writeStream = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));
  for (let styleFile of styles) {
    let filePath = path.join(stylesDir, styleFile.name);
    if (path.extname(styleFile.name) === '.css' && styleFile.isFile()) {
      const bundleFile = [];
      const readStream = fs.createReadStream(filePath, 'utf-8');
      readStream.on('data', chunk => bundleFile.push(chunk));
      readStream.on('end', () => bundleFile.forEach(file => writeStream.write(`${file}\n`)));
    }
  }
})();

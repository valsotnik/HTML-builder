const path = require('path');
const fs = require('fs/promises');

async function folderFilesInfo () {
  const files = await fs.readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });
  
  for (let file of files) {
    if (file.isFile()) {
      const [fileName] = file.name.split('.');
      const filePath = path.join(__dirname, 'secret-folder', file.name);
      const fileType = path.extname(filePath).slice(1);
      const stats = await fs.stat(filePath);
      const fileSize = `${stats.size / 1024}kb`;

      console.log(`${fileName} - ${fileType} - ${fileSize}`);
    }
  }
}

folderFilesInfo();


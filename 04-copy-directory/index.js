const fs = require('fs/promises');
const path = require('path');

const originDir = path.join(__dirname,  'files');
const duplicateDir = path.join(__dirname,  'files-copy');

(async () => {

  await fs.mkdir(duplicateDir, { recursive: true });
  let dirFiles =  await fs.readdir(duplicateDir);
  
  for (let file of dirFiles) {
    await fs.rm(path.join(duplicateDir, file));
  }

  dirFiles = await fs.readdir(originDir);
  
  for (let file of dirFiles) {
    await fs.copyFile(path.join(originDir, file), path.join(duplicateDir, file));
  }

}
)();


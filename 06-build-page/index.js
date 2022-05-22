const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');



// ====Make project-dist directory and index.html======================
const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const finalProjectPath = path.join(__dirname, 'project-dist');

async function buildHTML() {
  const html = await fsPromises.readFile(templatePath);
  const componentFiles = await fsPromises.readdir(componentsPath);
  let innerPageContent = html.toString();
  
  for(let htmlFile of componentFiles) {
    const stats = await fsPromises.stat(path.join(componentsPath, htmlFile));
    if (stats.isFile() && path.extname(htmlFile) === '.html') {
      let componentName = path.basename(htmlFile, path.extname(htmlFile));
      let componentContent = await fsPromises.readFile(path.join(componentsPath, htmlFile));

      innerPageContent = innerPageContent.replace(`{{${componentName}}}`, componentContent.toString());
    }
  }
  await fsPromises.mkdir(finalProjectPath, { recursive: true });
  await fsPromises.writeFile(path.join(finalProjectPath, 'index.html'), innerPageContent);
}

//======= Make bundle styles from origin css===========
const stylesDir = path.join(__dirname, 'styles');

async function stylesBundle () {
  let styles = await fsPromises.readdir(stylesDir, { withFileTypes: true });
  const writeStream = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));
  for (let styleFile of styles) {
    let filePath = path.join(stylesDir, styleFile.name);
    if (path.extname(styleFile.name) === '.css' && styleFile.isFile()) {
      const bundleFile = [];
      const readStream = fs.createReadStream(filePath, 'utf-8');
      readStream.on('data', chunk => bundleFile.push(chunk));
      readStream.on('end', () => bundleFile.forEach(file => writeStream.write(`${file}\n`)));
    }
  }
}


// ===== Copy assets dir===================
const originAssets = path.join(__dirname,  'assets');
const duplicateAssets = path.join(__dirname, 'project-dist' ,'assets');

async function copyAssetsDir (inputPath, outputPath) {

  await fsPromises.mkdir(outputPath, { recursive: true });
  let dirFiles =  await fsPromises.readdir(outputPath);
  
  for (let file of dirFiles) {
    await fsPromises.rm(path.join(outputPath, file));
  }

  dirFiles = await fsPromises.readdir(inputPath);
  
  for (let file of dirFiles) {

    let stats = await fsPromises.stat(path.join(dirFiles, file));
    if (!stats.isDirectory()) {
      await fsPromises.copyFile(path.join(inputPath, file), path.join(outputPath, file));
    } else {
      await copyAssetsDir(path.join(inputPath, file), path.join(outputPath, file));
    }
  }


}



//=======Make output project============

(async function builProject() {

  await buildHTML();
  await stylesBundle();
  // await copyAssetsDir(originAssets, duplicateAssets);
})();




const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// ====Make project-dist directory and put in filled index.html file======================
const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const projectDistPath = path.join(__dirname, 'project-dist');

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
  await fsPromises.mkdir(projectDistPath, { recursive: true });
  await fsPromises.writeFile(path.join(projectDistPath, 'index.html'), innerPageContent);
}

//======= Make bundle styles from origin css files ================
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

// ===== Copy assets===========================================
const originAssets = path.join(__dirname,  'assets');
const duplicateAssets = path.join(__dirname, 'project-dist' ,'assets');

async function copyAssetsDir (inputDir, outputDir) {

  await fsPromises.mkdir(duplicateAssets, { recursive: true });
  const dirFiles = await fsPromises.readdir(inputDir, {withFileTypes: true});
  
  dirFiles.forEach(async (file) => {
    if(file.isFile()) {
      fsPromises.copyFile(path.join(inputDir, file.name), path.join(outputDir, file.name));
    } else if (file.isDirectory()) {
      await fsPromises.mkdir(path.join(outputDir, file.name));
      await copyAssetsDir(path.join(inputDir, file.name), path.join(outputDir, file.name));
    }
  });

}


//=======Construct of output project==================================

(async () => {

  await buildHTML();
  await stylesBundle();
  await copyAssetsDir(originAssets, duplicateAssets);
})();




const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(filePath);
const {stdin, stdout, exit} = process;

stdout.write('Please, enter your text. It will be saved in output.txt\n' +
  'If you want to quit - push Ctrl + C or enter "exit" in terminal\n');
stdin.on('data', data => {
  if (data.toString().trim() === 'exit') exit();
  writeStream.write(data.toString());
});

process.on('SIGINT', exit);
process.on('exit', () => stdout.write('\nGoodbye!\n'));

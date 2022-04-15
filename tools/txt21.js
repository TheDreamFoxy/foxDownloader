const fs = require('fs');

let txtFiles = fs.readdirSync('./urls');

txtFiles.forEach(fileName => {
    let file = fs.readFileSync('./urls/' + fileName, 'utf-8');
    fs.appendFileSync('./list.txt', file);
    console.log('Appended:', fileName)
});
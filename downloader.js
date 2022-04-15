const https = require('https');
const http = require('http');
const fs = require('fs');

const list = fs.readFileSync('./list.txt', 'utf-8').replace(/\r/g, '').split('\n');

let i = parseInt(process.argv[2]) || 0;
console.log('Starting from line', i);

loop(i);
function loop(i){
    let url = list[i];
    if(!url) return exit('No more URLs remaining. Quitting...');

    if(url.split('//')[0].includes('https:')){
        getHttps(url);
    } else {
        getHttp(url);
    };  
};

function getHttps(url){

    let r = https.get(url, response => {

        try {
            parse(response, url);
        } catch (e) {
            console.log(e.message);
            i++
            loop(i);
        };
    });
    r.on('error', e => handleError(e.message));
};

function getHttp(url){
    let r = http.get(url, response => {

        try {
            parse(response, url);
        } catch (e) {
            console.log(e.message);
            i++
            loop(i);
        };
    });
    r.on('error', e => handleError(e.message));
};

function parse(response, url){
    if(response.statusCode != 200 && response.statusCode != 301 && response.statusCode != 302) return handleError(`Wrong status code at ${url}. Should be 200 but is ${response.statusCode}, skipping...`);
    if(response.statusCode == 301 && !url.split('//')[0].includes('https:')) return getHttps(url.replace('http://', 'https://'));
    if(response.statusCode == 302 && !url.split('//')[0].includes('https:')) return getHttps(url.replace('http://', 'https://'));

    try {
        let fileName = url.split('/').pop()?.split('?')[0]
        let file = fs.createWriteStream('./saves/'+fileName);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log("Downloaded:", url);
        });  
    } catch (e) {
        console.log('Error while writing into file:', e.message)
    };

    i++
    loop(i);
};

function handleError(log = 'Handled unknown error.'){
    console.log(log);
    i++
    loop(i);
};

function exit(message){
    console.log(message);
    process.exit(0);
};
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

const variants = require('./variants.json');
const stats = require('./stats.json');

const webserver = express(); // создаём веб-сервер

//при обращении в корень сайта, отдадим index.html
webserver.use(express.static(path.join(__dirname, 'public')));
webserver.use(bodyParser.json());
//webserver.use(bodyParser.urlencoded({extended:true}));
//webserver.use(express.urlencoded({extended:true}));

const port = 3095;

const logFN = path.join(__dirname, '_server.log');

// пишет строку в файл лога и одновременно в консоль
function logLineSync(logFilePath,logLine) {
    const logDT=new Date();
    let time=logDT.toLocaleDateString()+" "+logDT.toLocaleTimeString();
    let fullLogLine=time+" "+logLine;

    console.log(fullLogLine); // выводим сообщение в консоль

    const logFd = fs.openSync(logFilePath, 'a+'); // и это же сообщение добавляем в лог-файл
    fs.writeSync(logFd, fullLogLine + os.EOL); // os.EOL - это символ конца строки, он разный для разных ОС
    fs.closeSync(logFd);
}

/*webserver.get('/', function(req, res) {
    //console.log(__dirname);
    console.log("test");
    res.sendFile('index.html',{ root : __dirname + "/public"});
    //res.send(makeFormPage());
    logLineSync(logFN,`[${port}] `+"index.html called");
});*/

webserver.get('/variants', function(req, res) {
    logLineSync(logFN,`[${port}] `+"/variants service called");
    res.send(variants);
});

webserver.get("/stats",function(req, res) {
    logLineSync(logFN,`[${port}] `+"/stats service called");
    res.send(stats);
});

webserver.post("/vote",function(req, res) {

    let fileContent = fs.readFileSync("stats.json");
    fileContent = JSON.parse(fileContent);

    fileContent.forEach(elem => {
        if(elem.code === req.body.vote){
            elem.count = elem.count + 1;
        }
    });

    fs.writeFileSync("stats.json", JSON.stringify(fileContent));
    fileContent = fs.readFileSync("stats.json", "utf8");
    res.send(fileContent);

    //logLineSync(logFN,`[${port}] `+"/variants service called");
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});
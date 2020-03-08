const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');
const js2xmlparser = require("js2xmlparser");//парсер из json в xml
//const jsontoxml = require("jsontoxml");
const crypto = require('crypto');

//const variants = require('./variants.json');
//const stats = require('./stats.json');

const webserver = express(); // создаём веб-сервер

//при обращении в корень сайта, отдадим index.html
//и в целом раздача статики
webserver.use(express.static(path.join(__dirname, 'public')));
webserver.use(bodyParser.json());
//webserver.use(bodyParser.urlencoded({extended:true}));
//webserver.use(express.urlencoded({extended:true}));

const port = 3595;

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
    let variants = fs.readFileSync("jsonFiles/variants.json", "utf8");
    res.send(variants);
});

webserver.get("/stats",function(req, res) {
    logLineSync(logFN,`[${port}] `+"/stats service called");
    let stats = fs.readFileSync("jsonFiles/stats.json", "utf8");

    //создадим etag при помощи пакета "crypto"
    let ETag = crypto.createHash('sha512').update(stats).digest('hex');
    let ifNoneMatch=req.header("If-None-Match");
    if ( ifNoneMatch && (ifNoneMatch===ETag) ) {
        logLineSync(logFN,`[${port}] `+"отдаём 304 т.к. If-None-Match совпал с ETag");
        //console.log("отдаём 304 т.к. If-None-Match совпал с ETag");
        res.status(304).end(); // в кэше браузера - годная версия, пусть её использует
    }else{
        res.setHeader("ETag",ETag);
        //res.setHeader("Cache-Control","public, max-age=60"); // ответ может быть сохранён любым кэшем, в т.ч. кэшем браузера, на 1 минуту
        //кешируем запрос на 0 секунд
        res.setHeader("Cache-Control","public, max-age=0"); // ответ может быть сохранён любым кэшем, в т.ч. кэшем браузера, на 0 секунд
        res.send(stats);
    }

    //console.log("etag: ",etag);

});

webserver.post("/vote",function(req, res) {

    logLineSync(logFN,`[${port}] `+"/vote service called");
    let fileContent = fs.readFileSync("jsonFiles/stats.json", "utf8");
    fileContent = JSON.parse(fileContent);

    fileContent.forEach(elem => {
        if(elem.code === req.body.vote){
            elem.count = elem.count + 1;
        }
    });

    fs.writeFileSync("jsonFiles/stats.json", JSON.stringify(fileContent));
    fileContent = fs.readFileSync("jsonFiles/stats.json", "utf8");
    res.send(fileContent);

});

webserver.post("/getinfo",function(req, res) {

    logLineSync(logFN,`[${port}] `+"/getInfo service called");
    let fileContent = fs.readFileSync("jsonFiles/stats.json", "utf8");

    const clientAccept=req.headers.accept;
    if ( clientAccept==="application/json" ) {
        res.setHeader("Content-Type", "application/json");
        //console.log("json: ",fileContent);
        logLineSync(logFN,`[${port}] `+"send: "+`${JSON.stringify(fileContent)}`);
        res.send(JSON.stringify(fileContent));
        //res.send(JSON.stringify(fileContent));
    }else if ( clientAccept==="text/xml" ) {
        //console.log("fileContent: ", fileContent);
        logLineSync(logFN,`[${port}] `+"send: "+`${JSON.parse(fileContent)}`);
        res.setHeader("Content-Type", "text/xml");
        res.send(js2xmlparser.parse("stats", JSON.parse(fileContent)));
    }else if ( clientAccept==="text/html" ) {
        res.setHeader("Content-Type", "text/html");
        fileContent = JSON.parse(fileContent);
        let stats = fileContent.map( stat =>
            `<div><span>${stat.code}: </span><span>${stat.name}: </span><span style="font-weight: bold;">${stat.count}</span></div>`
        ).join(`<br>`);
        logLineSync(logFN,`[${port}] `+"send: "+`${stats}`);
        res.send(stats);
    }
    /*else {
        res.setHeader("Content-Type", "text/plain");
        res.send("count=5 price=777");
    }*/

});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});
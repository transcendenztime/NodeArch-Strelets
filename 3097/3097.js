const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const webserver = express(); // создаём веб-сервер

webserver.use(express.urlencoded({extended:true}));

const port = 3097;

const logFN = path.join(__dirname, '_server.log');
const { check, validationResult } = require('express-validator');

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

//формируем html-страницу (форму)
function makeFormPage(errorsObj, formValues) {
    let body = `
    <head>
        <title>Strelets(3097)</title>
    </head>
    
    <body>
    
    <h1>Strelets(3097)</h1>
    
    
    <div>
        <form method="GET" action="/user">
            ваш логин: <input type="text" autocomplete="off"`;

    if(formValues && formValues.login) {
        body += `value="${(formValues.login)}"`;
    }

    body += `name="login">`;

    if(errorsObj && errorsObj.login && errorsObj.login.msg) {
        body += ` <span style="color: red;">${errorsObj.login.msg}</span>`;
    }

    body += `<br><br> ваш пароль: <input type="text" autocomplete="off"`;

    if(formValues && formValues.password) {
        body += `value="${(formValues.password)}"`;
    }

    body += `name="password">`;

    if(errorsObj && errorsObj.password && errorsObj.password.msg) {
        body += ` <span style="color: red;">${errorsObj.password.msg}</span>`;
    }

    body += `<br><br> ваш email: <input type="text" autocomplete="off"`;

    if(formValues && formValues.email) {
        body += `value="${(formValues.email)}"`;
    }

    body += `name="email">`;

    if(errorsObj && errorsObj.email && errorsObj.email.msg) {
        body += ` <span style="color: red;">${errorsObj.email.msg}</span>`;
    }

    body += `<br><br> ваш возраст: <input type="number"`;

    if(formValues && formValues.age) {
        body += `value="${(formValues.age)}"`;
    }

    body += `name="age">`;

    if(errorsObj && errorsObj.age && errorsObj.age.msg) {
        body += ` <span style="color: red;">${errorsObj.age.msg}</span>`;
    }

    body += `<br><br>
        <input type="submit" value="Отправить форму">
        </form>
    </div>
    
    </body>`;

    return body;
}

//формируем страницу с данными пользователя
function makeUserDataPage(formValues) {
    let body = `
    <head>
        <title>Strelets(3097) user data</title>
    </head>
    
    <body>
    
    <h1>Strelets(3097) user data</h1>
    
    <div>
    <h2>Данные пользователя:</h2>
    <span style="font-weight: bold">login: </span> <span>${formValues.login}</span>
    <br><span style="font-weight: bold">password: </span> <span>${formValues.password}</span>
    <br><span style="font-weight: bold">email: </span> <span>${formValues.email}</span>
    <br><span style="font-weight: bold">age: </span> <span>${formValues.age}</span>
    </div>
    
    </body>`;

    return body;
}

webserver.get('/', function(req, res) {
    //res.sendFile('index.html',{ root : __dirname});

    res.send(makeFormPage());
    logLineSync(logFN,`[${port}] `+"index.html called");
});

webserver.get('/user',[
    //валидация
    check('login')
        .not().isEmpty()
        .withMessage("Поле обязательно для заполения")
        .isAlphanumeric()
        .withMessage('Буквы и цифры')
        .isLength({ min: 5, max: 16, })
        .withMessage('От 5 до 16 символов')
        .escape(),

    check('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('От 8 до 16 символов')
        .escape(),

    check('email')
        .not().isEmpty()
        .withMessage("Поле обязательно для заполения")
        .isEmail()
        .withMessage('Тут должен быть email')
        .escape(),

    check('age')
        .not().isEmpty()
        .withMessage("Поле обязательно для заполения")
        .isInt({min: 18,})
        .withMessage('Старше 18 лет')
        .escape(),

], (req, res) => {

    logLineSync(logFN,`[${port}] `+"/user called, get pars: "+JSON.stringify(req.query));

    const errors = validationResult(req);
    let errorsObj = errors.mapped();
    console.log("errors: ", errorsObj);

    //если есть ошибки (если форма не прошла валидацию), выведем форму со всеми значениями и ошибками
    if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        return res.send(makeFormPage(errorsObj, req.query));
    }

    //если ошибок нет, выведем все данные формы
    res.send(makeUserDataPage(req.query));
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});
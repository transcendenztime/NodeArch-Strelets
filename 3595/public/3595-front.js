window.onload = () => start();

function start(){
    getVariants();
    getStats();
}

//получаем варианты ответов
function getVariants(){
    fetch('/variants', {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then( data => {
            let variants = data.map( variant =>
                `<input type="button" id="${variant.code}_" value="${variant.name}" onclick=sendVote("${variant.code}")><br>`
            ).join(`<br>`);
            document.getElementById("buttons").innerHTML = variants;
        })
}

//получаем статистику
function getStats() {
    fetch('/stats', {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then( data => {
            updateStats(data);
        })
}

//обновляем статистику на странице
function updateStats(data) {
    let stats = data.map( stat =>
        `<div><span>${stat.name}: </span><span style="font-weight: bold;">${stat.count}</span></div>`
    ).join(`<br>`);
    document.getElementById("stats").innerHTML = stats;
}

//голосуем за какой-то вариант
function sendVote(code) {
    let body = JSON.stringify({vote: code});
    fetch('/vote', {method: "POST", headers: {'Content-Type': 'application/json'}, body: body})
        .then(response => response.json())
        .then( data => {
            //updateStats(data);
            getStats();
        })
}

//получаем статичтику в разных форматах
function getInfo(code) {
    let body = JSON.stringify({code: code});
    if(code === "xml"){
        //alert("xml");
        fetch('/getinfo', {method: "POST", headers: {'Content-Type': 'application/json', 'Accept' : 'text/xml'}, body: body})
            //.then(response => response.json())
            .then(response => response.text())
            .then( data => {
                document.getElementById("formatsTextArea").innerHTML = data;
            })
    }else if(code === "html"){
        //alert("html");
        fetch('/getinfo', {method: "POST", headers: {'Content-Type': 'application/json', 'Accept' : 'text/html'}, body: body})
            .then(response => response.text())
            .then( data => {
                document.getElementById("formatsTextArea").innerHTML = data;
            })
    }else if(code === "json"){
        //alert("json");
        fetch('/getinfo', {method: "POST", headers: {'Content-Type': 'application/json', 'Accept' : 'application/json'}, body: body})
            .then(response => response.json())
            .then( data => {
                document.getElementById("formatsTextArea").innerHTML = data;
            })
    }else{
        alert("Unknown Header.Accept");
    }
}

window.onload = () => start();

function start(){
    //document.getElementById("test").innerText = "Hello111!!!";
    //document.getElementById("test").innerHTML = "Hello111!!!";
    getVariants();
    getStats();
}

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

function getStats() {
    fetch('/stats', {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then( data => {
            updateStats(data);
        })
}

function updateStats(data) {
    let stats = data.map( stat =>
        `<div><span>${stat.name}: </span><span style="font-weight: bold;">${stat.count}</span></div>`
    ).join(`<br>`);
    document.getElementById("stats").innerHTML = stats;
}

function sendVote(code) {
    let body = JSON.stringify({vote: code});
    fetch('/vote', {method: "POST", headers: {'Content-Type': 'application/json'}, body: body})
        .then(response => response.json())
        .then( data => {
            //updateStats(data);
            getStats();
        })
}
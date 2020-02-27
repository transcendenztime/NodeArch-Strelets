//const isoFetch = require('isomorphic-fetch');

//import isoFetch from 'isomorphic-fetch';

window.onload = () => start();

function start(){
    document.getElementById("test").innerText = "Hello111!!!";
    //document.getElementById("test").innerHTML = "Hello111!!!";
    getVariants();
    getStats();
}

function getVariants(){
    fetch('/variants', {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then( data => {
            console.log("front variants: ",data);
            /*let root = document.getElementById('root');
            if (!root.hasChildNodes()){
                let variants = data.map( variant => `<input type="button" id="${variant.code}" value="${variant.text}" onclick="vote(this.id)">`)
                    .join('');
                let variantsContainer = document.createElement('div');
                variantsContainer.innerHTML = variants;
                root.appendChild(variantsContainer);
            }*/
            let variants = data.map( variant =>
                `<input type="button" id="${variant.code}_" value="${variant.name}" onclick=sendVote("${variant.code}")><br>`
            ).join(`<br>`);
            console.log(variants);
            document.getElementById("buttons").innerHTML = variants;
        })
}

function getStats() {
    fetch('/stats', {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then( data => {
            console.log("front stats: ",data);
            let stats = data.map( stat =>
                `<div><span>${stat.name}: </span><span style="font-weight: bold;">${stat.count}</span></div>`
                ).join(`<br>`);
            console.log(stats);
            document.getElementById("stats").innerHTML = stats;
            /*let root = document.getElementById('root');
            if (!root.hasChildNodes()){
                let variants = data.map( variant => `<input type="button" id="${variant.code}" value="${variant.text}" onclick="vote(this.id)">`)
                    .join('');
                let variantsContainer = document.createElement('div');
                variantsContainer.innerHTML = variants;
                root.appendChild(variantsContainer);
            }*/
        })
}

function sendVote(code) {
    console.log("code: ", code);
    let body = JSON.stringify({vote: code});
    fetch('/vote', {method: "POST", headers: {'Content-Type': 'application/json'}, body: body})
        .then(response => response.json())
        .then( data => {
            //console.log{}
            getStats();
        })
}
const express = require('express');
const app = express();

const port = 8000;

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.use(express.static('public'));
app.listen(port, () => {});

console.log(`Server started on port ${port}...`);
//console.log(window.location.pathname);

//partie js
/*
var $;
var jsdom = require("jsdom");
jsdom.
//var cheerio=require("cheerio");
//var $=cheerio.load('<html></html>')


var sparkService = require('./public/js/sparkService');

$('#login-button').on('click', () => {
  sparkService.authorize().then(() => {
    window.location.pathname = 'index.html';
  });
});
*/

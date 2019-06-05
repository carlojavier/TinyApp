const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');

app.set("view engine", "ejs");

// set up morgan
app.use(morgan('dev'));

// set urlDatabase
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
// implement bodyParser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls/new", (request, response) => {
    response.render("urls_new");
});

app.get("/urls/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
    response.render("urls_show", templateVars);
});

app.get("/urls", (request, response) => {
    let templateVars = { urls: urlDatabase };
    response.render("urls_index", templateVars);
});

app.post("/urls", (request, response) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = request.body.longURL
    response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (request, response) => {
    let longURL = request.params.shortURL
    response.redirect(urlDatabase[longURL]);
});

app.post("/urls/:shortURL/delete", (request, response) => {
    delete urlDatabase[request.params.longURL];
    response.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});

function generateRandomString() {
    const length = 5;
    const chars = 'qwertyuioplkjhgfdsazxcvbnm0987654321ZXCVBNMLKJHGFDSAQWERTYUIOP';
    var result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
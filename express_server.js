const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require("body-parser");

// set view engine to ejs
app.set("view engine", "ejs");
// set up morgan
app.use(morgan('dev'));
// set up middleware
app.use(bodyParser.urlencoded({ extended: true }));

// set urlDatabase
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

// route to index
app.get("/urls", (request, response) => {
    const templateVars = { urls: urlDatabase };
    response.render("urls_index", templateVars);
});

// GET route to show the submission form
app.get("/u/:shortURL", (request, response) => {
    let longURL = request.params.shortURL
    response.redirect(urlDatabase[longURL]);
});

// POST route to receive form
app.post("/urls", (request, response) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = request.body.longURL
    response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (request, response) => {
    response.render("urls_new");
});

// GET route to render short URL
app.get("/urls/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
    response.render("urls_show", templateVars);
});

// another POST route to receive submit function
app.post("urls/:shortURL/", (request, response) => {
    const newURL = request.body.longURL;
    const id = request.params.longURL;
    if (newURL) {
        urls[id] = newURL;
    }
    response.redirect(`/urls/${id}`);
    console.log(newURL)
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
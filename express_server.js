const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

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
    console.log(request.body); // Log the POST request body to the console
    response.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});

function generateRandomString(length, chars) {
    var result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

var rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
console.log(rString);
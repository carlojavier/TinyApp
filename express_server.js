var express = require("express");
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/urls", (require, response) => {
    let templateVars = { urls: urlDatabase };
    response.render("urls_index", templateVars);
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
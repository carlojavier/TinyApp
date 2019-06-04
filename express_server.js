var express = require("express");
var app = express();
var PORT = 8080; // this is the default port

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (require, response) => {
    response.send("A Lannister always pays his debts.");
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
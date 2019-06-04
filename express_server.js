var express = require("express");
var app = express();
var PORT = 8080;

app.set("view enging", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/Dracarys", (require, response) => {
    response.send("<html><body>Dracarys <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
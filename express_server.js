const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// set view engine to ejs
app.set("view engine", "ejs");
// set up morgan
app.use(morgan('dev'));
// set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
// set up cookie-parser
app.use(cookieParser());

function generateRandomString() {
    const length = 5;
    const chars = 'qwertyuioplkjhgfdsazxcvbnm0987654321ZXCVBNMLKJHGFDSAQWERTYUIOP';
    var result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// set urlDatabase
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
// set user database
const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "something-important-prob"
    },

    "alsoUserRandomID": {
        id: "alsoUserRandomID",
        email: "alsoUser@example.com",
        password: "also-something-important-idk"
    }
}
// fuction that goes through email sign up sheet
function doesEmailExistInDatabase(email) {
    let exists = false
    for (var key in users) {
        if (email === users[key].email) {
            exists = true
        }
    }
    return exists
}
// function to go through all handlers and replace username info with userID
function createTemplateVars(userID) {
    if (users[userID]) {
        let currentUser = users[userID]
        const templateVars = {
            urls: urlDatabase,
            currentUser: currentUser
        };
        return templateVars
    } else {
        const templateVars = {
            urls: urlDatabase,
            currentUser: {}
        };
        return templateVars
    }
}
// function to enforce conditional on existing emails and passwords
function checkUser(email, password) {
    for (var key in users) {
        if (users[key].email === email && users[key].password === password) {
            return users[key];
        }
    }
    return false;
}

app.get("/register", (request, response) => {
    const templateVars = createTemplateVars(request.cookies.UserID);
    response.render("urls_register", templateVars);
});

app.get("/urls", (request, response) => {
    const templateVars = createTemplateVars(request.cookies.UserID);
    console.log(templateVars)
    response.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
    const longURL = request.params.shortURL
    response.redirect(urlDatabase[longURL]);
});

app.get("/login", (request, response) => {
    response.render("urls_login");
});

app.get("/logout", (request, response) => {
    response.render("urls_new");
})

app.get("/urls/new", (request, response) => {
    if (!request.cookies.UserID) {
        response.status(403)
        response.redirect("/urls")
        return
    }
    const templateVars = createTemplateVars(request.cookies.UserID);
    response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    let templateVars = createTemplateVars(request.cookies.UserID);
    templateVars["shortURL"] = shortURL;
    templateVars["longURL"] = urlDatabase[shortURL];
    response.render("urls_show", templateVars);
});

app.post("/register", (request, response) => {
    const newUserID = generateRandomString();
    console.log(request.body)
    const newUser = {
        id: newUserID,
        email: request.body.email,
        password: request.body.password
    };
    console.log(newUser);
    if (newUser.email === "" || newUser.password === "") {
        response.status(400).send("What do we say to the God of cutting URLs? Not today");
    } else if (doesEmailExistInDatabase(newUser.email)) {
        response.status(400).send("lol get your own email")
    } else {
        users[newUserID] = newUser;
        response.cookie("UserID", newUserID);
        response.redirect("/urls");
    }
});

app.post("/urls", (request, response) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = request.body.longURL
    response.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/", (request, response) => {
    console.log(request.params)
    const newURL = request.body.longURL;
    const id = request.params.shortURL;
    if (newURL) {
        urlDatabase[id] = newURL;
    }
    response.redirect(`/urls/${id}`);
    console.log(newURL)
});

app.post("/urls/:shortURL/delete", (request, response) => {
    delete urlDatabase[request.params.shortURL];
    response.redirect('/urls');
});


app.post("/login", (request, response) => {
    const userResult = checkUser(request.body.email, request.body.password)
    if (userResult) {
        response.cookie("UserID", userResult.id)
        response.redirect('/urls');
    } else {
        response.status(403).send("haha its not here");
    }

});

app.post("/logout", (request, response) => {
    const templateVars = createTemplateVars(request.cookies.UserID);
    if (!templateVars.currentUser) {
        response.status(403).send("Not for you to see")
    } else if (templateVars) {
        //remove cookies
        response.cookie("UserID", null);
    }
    console.log(templateVars)
    response.redirect('/urls')
})

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
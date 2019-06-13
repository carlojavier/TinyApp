const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
    name: "session",
    keys: ['key1', 'key2']
}));

function generateRandomString() {
    const length = 5;
    const chars = 'qwertyuioplkjhgfdsazxcvbnm0987654321ZXCVBNMLKJHGFDSAQWERTYUIOP';
    var result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "alsoUserRandomID" }
};

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
};

function doesEmailExistInDatabase(email) {
    let exists = false
    for (var key in users) {
        if (email === users[key].email) {
            exists = true
        };
    };
    return exists
};

function urlsForUser(userID) {
    let usersURL = {};
    for (let key in urlDatabase) {
        if (urlDatabase[key].userID === userID) {
            usersURL[key] = urlDatabase[key];
        };
    };
    return usersURL;
};

function createTemplateVars(userID) {
    if (users[userID]) {
        let currentUser = users[userID]
        const templateVars = {
            urls: urlsForUser(userID),
            currentUser: currentUser
        };
        return templateVars
    } else {
        const templateVars = {
            urls: urlsForUser(userID),
            currentUser: {}
        };
        return templateVars
    };
};

function checkUser(email, password) {
    for (var key in users) {
        if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
            return users[key];
        };
    };
    return false;
};

app.get("/", (request, response) => {
    if (request.session.UserID) {
        response.redirect("/urls");
    } else if (!request.session.UserID) {
        response.redirect("/login");
    }
})

app.get("/register", (request, response) => {
    const templateVars = createTemplateVars(request.session.UserID);
    response.render("urls_register", templateVars);
});

app.get("/urls", (request, response) => {
    const templateVars = createTemplateVars(request.session.UserID);
    console.log(templateVars)
    response.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    response.redirect(urlDatabase[shortURL].longURL);
});

app.get("/login", (request, response) => {
    response.render("urls_login");
});

app.get("/logout", (request, response) => {
    response.render("urls_new");
})

app.get("/urls/new", (request, response) => {
    if (!request.session.UserID) {
        response.status(403).send();
        response.redirect("/urls")
        return
    };
    const templateVars = createTemplateVars(request.session.UserID);
    response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    if (urlDatabase[shortURL]) {
        let templateVars = createTemplateVars(request.session.UserID);
        templateVars["shortURL"] = shortURL;
        if (templateVars.currentUser.id !== null) {
            response.render("urls_show", templateVars);
        } else {
            response.status(403).send("wrong!")
        }
    } else {
        response.status(403).send("wrong!")
    }
});


app.post("/register", (request, response) => {
    const hashedPassword = bcrypt.hashSync(request.body.password, 10);
    const newUserID = generateRandomString();
    const newUser = {
        id: newUserID,
        email: request.body.email,
        password: hashedPassword
    };
    console.log(newUser);
    if (newUser.email === "" || newUser.password === "") {
        response.status(400).send()
    } else if (doesEmailExistInDatabase(newUser.email)) {
        response.status(400).send()
    } else {
        console.log('new user created:', newUser);
        users[newUserID] = newUser;
        request.session.UserID = newUserID;
        response.redirect("/urls");
    };
});

app.post("/urls", (request, response) => {
    const shortURL = generateRandomString();
    const newURL = request.body.longURL;
    if (newURL) {
        urlDatabase[shortURL] = { longURL: newURL, userID: request.session.UserID };
    };
    response.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/", (request, response) => {
    if (!request.session.UserID) {
        response.redirect("/urls");
        return
    };
    const newURL = request.body.longURL;
    const id = request.params.shortURL;
    if (newURL) {
        urlDatabase[id] = { longURL: newURL, userID: request.session.UserID };
    };
    response.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (request, response) => {
    delete urlDatabase[request.params.shortURL];
    response.redirect('/urls');
});


app.post("/login", (request, response) => {
    const userResult = checkUser(request.body.email, request.body.password)
    if (userResult) {
        request.session.UserID = userResult.id;
        response.redirect('/urls');
    } else {
        response.status(403).send('Forbidden');
    };
});

app.post("/logout", (request, response) => {
    const templateVars = createTemplateVars(request.session.UserID);
    if (!templateVars.currentUser) {
        response.status(403).send()
    } else if (templateVars) {
        request.session.UserID = null;
    };
    response.redirect('/urls')
});

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
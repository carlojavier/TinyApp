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

function doesEmailExistInDatabase(email) {
    let exists = false
    for (var key in users) {
        if (email === users[key].email) {
            exists = true
        }
    }
    return exists
}

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

function checkUser(email, password) {
    for (var key in users) {
        if (users[key].email === email && users[key].password === password) {
            return users[key];
        }
    }
    return false;
}

app.get("/register", (request, response) => {
    // const templateVars = {
    //     urls: urlDatabase,
    //     username: request.cookies.username
    // };
    const templateVars = createTemplateVars(request.cookies.UserID);
    response.render("urls_register", templateVars);

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

// route to index
app.get("/urls", (request, response) => {
    // let currentUser = users[request.cookies.UserID]
    // const templateVars = {
    //     urls: urlDatabase,
    //     currentUser: currentUser
    // };
    const templateVars = createTemplateVars(request.cookies.UserID);
    console.log(templateVars)
    response.render("urls_index", templateVars);
});

// GET route to show the submission form
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
    // const templateVars = { username: request.cookies["username"] };
    const templateVars = createTemplateVars(request.cookies.UserID);
    response.render("urls_new", templateVars);
});

// GET route to render short URL
app.get("/urls/:shortURL", (request, response) => {
    const shortURL = request.params.shortURL
    // const templateVars = {
    //     shortURL: shortURL,
    //     longURL: urlDatabase[shortURL],
    //     username: request.cookies["username"]
    // };
    let templateVars = createTemplateVars(request.cookies.UserID);
    templateVars["shortURL"] = shortURL;
    templateVars["longURL"] = urlDatabase[shortURL];
    response.render("urls_show", templateVars);
});

// POST route to receive form
app.post("/urls", (request, response) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = request.body.longURL
    response.redirect(`/urls/${shortURL}`);
});

// another POST route to receive submit function, i think this one is messed
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
    // const name = request.body.username;
    // response.cookie('username', name);
    const userResult = checkUser(request.body.email, request.body.password)
    if (userResult) {
        response.cookie("user_id", userResult.id)
        response.redirect('/urls');
    } else {
        response.status(403).send("haha its not here");
    }

});

app.post("/logout", (request, response) => {
    // const name = request.body.username;
    // response.clearCookie('username', name);
    const templateVars = createTemplateVars(request.cookies.UserID);
    if (!templateVars) {
        response.status(403).send("Not for you to see")
    } else if (templateVars) {

    }
    console.log(templateVars)
    response.redirect('/urls')
})

app.listen(PORT, () => {
    console.log(`Sample app listening on port ${PORT}!`);
});
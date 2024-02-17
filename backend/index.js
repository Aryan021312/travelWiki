const express = require('express');
const session = require('express-session'); // Added express-session
const port = process.env.PORT || 7070;
const app = express();
var path = require('path');
const collection = require("./src/mongodb")
// Use express-session middleware
app.set('view engine', 'ejs');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes'));
app.use(express.urlencoded({ extend: false }))

// Middleware to check login status
app.use((req, res, next) => {
    // Check if user is logged in
    req.session.loggedIn = req.session.loggedIn || false;
    next();
});

app.get("/", (req, res) => {
    res.render("wiki");
});

app.get("/login.ejs", (req, res) => {
    res.render("login");
});
app.get("/socials.ejs", (req, res) => {
      // Check if the user is logged in
      if (req.session.loggedIn) {
        res.render("socials");
    } else {
        res.redirect("/login.ejs");
    }
});
app.get("/fesabout.ejs", (req, res) => {
      // Check if the user is logged in
      if (req.session.loggedIn) {
        res.render("fesabout");
    } else {
        res.redirect("/login.ejs");
    }
});
app.get("/blog.ejs", (req, res) => {
    // Check if the user is logged in
    if (req.session.loggedIn) {
        res.render("blog");
    } else {
        res.redirect("/login.ejs");
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/blog.ejs", async (req, res) => {
    // Check if the user is logged in
    if (req.session.loggedIn) {
        // Handle blog post logic here
        const postData = {
            title: req.body.title,
            content: req.body.content,
            // Add other properties as needed
        };

        // Add your logic to save the blog post data to the database
        // Example: await blogPostCollection.insertOne(postData);

        res.send("Blog post submitted successfully!");
    } else {
        res.redirect("/login.ejs");
    }
});

app.post("/signup.ejs", async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender
    };

    try {
        await collection.create(data);
        // Assuming successful signup, set login status in the session
        req.session.loggedIn = true;
        res.redirect("/blog.ejs");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
});


app.post("/login.ejs", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.name });
        if (check && check.password === req.body.password) {
            // Set login status in the session
            req.session.loggedIn = true;
            res.redirect("/blog.ejs");
        } else {
            res.send("Invalid Password");
        }
    } catch {
        res.send("Wrong Details");
    }
});

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server Successfully running on port:", port);
    }
});
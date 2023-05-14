const session = require('express-session');
const generateText = require('./modules/gptAi');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const User = require('./models/user'); // Import the User model or replace it with your own

const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(session({
  secret: 'peopleeat8Apples',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: A secure cookie requires an HTTPS connection
}))

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let postToRender = 0;

// Use middleware to populate posts for each request if not already present
app.use((req, res, next) => {
  if (!req.session.posts) {
    req.session.posts = [];
  }
  next();
});

app.get("/", function(req, res){
  if (req.session.userId) {
    res.render("home", { posts: req.session.posts });
  } else {
    res.redirect('/login');
  }
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  let date = new Date();
  let options = { weekday: 'short', day: 'numeric', month: 'long' };
  let formattedDate = date.toLocaleDateString('en-US', options);

  let post = {
    title: req.body.titleOfPost,
    content: req.body.contentOfPost,
    date: formattedDate
  };

  if (req.body.action === 'generate_ai') {
    console.log("WE ARE USING AI");
    generateText(post.content, function(err, generatedText) {
      if (err) {
        console.error(err);
        // Handle error, possibly send a response indicating an error occurred
        res.status(500).send("An error occurred while generating text.");
      } else {
        console.log(generatedText);
        post.content = generatedText;
        res.render("ai-page", { title: post.title, generatedText: post.content });
      }
    });
  } else {
    req.session.posts.push(post);
    res.redirect("/");
  }
});

app.get("/post/:title", function(req, res) {
  let title = req.params.title;
  console.log(title);

  req.session.posts.forEach(element => {
    if (element.title === title) {
      res.render("post", { title: element.title, date: element.date, content: element.content });
    }
  });
});





















const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
// configuration file
// /usr/local/etc/mongod.conf
// /opt/homebrew/etc/mongod.conf
// log directory
// /usr/local/var/log/mongodb
// /opt/homebrew/var/log/mongodb
// data directory
// /usr/local/var/mongodb
// /opt/homebrew/var/mongodb



//show dps shows your databaases

// Render the login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.render('login');
    }

    // Check if the provided password matches the stored password
    if (password !== user.password) {
      return res.render('login');
    }

    // Store the user ID in the session
    req.session.userId = user._id;

    // Redirect to the dashboard or desired page
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).render('login');
  }
});


// Render the signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/signup');
    }

    // Create a new user
    const newUser = new User({ email, password });
    await newUser.save();

    // Store the user ID in the session
    req.session.userId = newUser._id;

    // Redirect to the dashboard or desired page
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).render('signup');
  }
});


// Render the dashboard page
app.get('/', function(req, res) {
  if (req.session.userId) {
    res.render('dashboard', { posts: req.session.posts });
  } else {
    res.redirect('/login');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  // Clear the session data
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
});

// ...
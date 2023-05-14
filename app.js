//jshint esversion:6
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(session({
  secret: "peopleeat8Apples",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: A secure cookie requires an HTTPS connection
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/your_database_name", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log(err));

// Define the User and Note models
const User = require("./models/user");
const Note = require("./models/note");

// Use middleware to populate notes for each request if not already present
app.use((req, res, next) => {
  if (!req.session.notes) {
    req.session.notes = [];
  }
  next();
});

// Render the home page
app.get("/", function(req, res) {
  if (req.session.userId) {
    res.render("home", { notes: req.session.notes });
  } else {
    res.redirect("/login");
  }
});

// Render the about page
app.get("/about", function(req, res) {
  res.render("about", { content: aboutContent });
});

// Render the contact page
app.get("/contact", function(req, res) {
  res.render("contact", { content: contactContent });
});

// Render the compose page
app.get("/compose", function(req, res) {
  res.render("compose");
});

// Handle compose form submission
app.post("/compose", function(req, res) {
  let date = new Date();
  let options = { weekday: "short", day: "numeric", month: "long" };
  let formattedDate = date.toLocaleDateString("en-US", options);

  let note = new Note({
    title: req.body.titleOfPost,
    content: req.body.contentOfPost,
    date: formattedDate
  });

  if (req.body.action === "generate_ai") {
    console.log("WE ARE USING AI");
    generateText(note.content, function(err, generatedText) {
      if (err) {
        console.error(err);
        // Handle error, possibly send a response indicating an error occurred
        res.status(500).send("An error occurred while generating text.");
      } else {
        console.log(generatedText);
        note.content = generatedText;
        res.render("ai-page", { title: note.title, generatedText: note.content }); // Replace "your-template" with your actual EJS template name
      }
    });
  } else {
    note.save();
    req.session.notes.push(note);
    res.redirect("/");
  }
});

// Render a specific note
app.get("/note/:id", function(req, res) {
  const noteId = req.params.id;

  Note.findById(noteId, function(err, foundNote) {
    if (err || !foundNote) {
      console.log(err);
      res.status(404).send("Note not found");
    } else {
      res.render("note", { note: foundNote });
    }
  });
});

// Render the login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form

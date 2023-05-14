//jshint esversion:6
const session = require('express-session');
const generateText = require('./modules/gptAi');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

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

// Use middleware to populate posts for each request if not already present
app.use((req, res, next) => {
  if (!req.session.posts) {
    req.session.posts = [];
  }
  next();
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let postToRender=0;

app.get("/", function(req,res){
  if (req.session.userId) {
    res.render("home",{posts: req.session.posts})
  } else {
    res.redirect('/login');
  }
  


})


app.get("/about",function(req,res){
  res.render("about",{content : aboutContent})


})
app.get("/contact",function(req,res){
  res.render("contact",{content : contactContent})


})
app.get("/compose",function(req,res){
  res.render("compose");


})
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
            res.render("ai-page", {title:post.title, generatedText: post.content }); // Replace "your-template" with your actual EJS template name
          }
      });
  } else {
      req.session.posts.push(post);
      res.redirect("/");
  }
});





app.get("/post/:title",function(req,res) {
  
  let title= req.params.title;
  console.log(title);
 
  req.session.posts.forEach(element => {

      if(element.title===title){
        res.render("post",{title:element.title,date :element.date,content:element.content});
        
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

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);

    // Check if the passwords match
    if (!passwordMatch) {
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
      return res.render('signup');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
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
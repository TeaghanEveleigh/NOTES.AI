
const session = require('express-session');
const generateText = require('./modules/gptAi');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const User = require('./models/user');
const Note = require('./models/note'); // Import the User model or replace it with your own
const note = require('./models/note');
const bcrypt = require('bcryptjs');

const saltRounds = 10;
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

app.get("/",requireLogin, function(req, res){
  if (req.session.userId) {
    User.findById(req.session.userId)
      .populate('posts')
      .exec()
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }
        res.render("home", { posts: user.posts });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("An error occurred.");
      });
  } else {
    res.redirect('/login');
  }
});

app.get("/compose",requireLogin, function(req, res){
  res.render("compose");
});

app.post("/compose",requireLogin, function(req, res) {
  let date = new Date();
  let options = { weekday: 'short', day: 'numeric', month: 'long' };
  let formattedDate = date.toLocaleDateString('en-US', options);
  let reqbody=" ";
  if(req.body.contentOfPost){
    reqbody=req.body.contentOfPost;
  }
  let post = {
    title: req.body.titleOfPost,
    content: reqbody,
    date: formattedDate,
    prompt:req.body.Prompt
  };

  // Validation
  if (!post.title || (!post.content && !post.prompt)) {
    //return res.status(400).send('Invalid post data');
    res.redirect("/compose");
  }

  if (req.body.action === 'generate_ai') {
    console.log("WE ARE USING AI");
    generateText(post.prompt, function(err, generatedText) {
      if (err) {
        console.error(err);
        res.status(500).send("An error occurred while generating text.");
      } else {
        console.log(generatedText);
        post.prompt = generatedText;
        res.render("ai-page", { title: post.title, generatedText: post.content+post.prompt });
      }
    });
  } else {
    // Check if session exists and has userId
    if (!req.session || !req.session.userId) {
      return res.status(401).send('Unauthorized');
    }

    const userId = req.session.userId ;

    // Create a new note
    const newNote = new Note({
      user: userId,
      content: ""+post.content,
      date: post.date,
      title: post.title
    });

    newNote.save()
  .then(savedNote => {
    if (!savedNote) {
      throw new Error('Failed to save note');
    }
    // Retrieve the user
    return User.findById(userId).exec().then(user => ({user, savedNote}));
  })
  .then(data => {
    if (!data.user) {
      throw new Error('User not found');
    }
    data.user.posts.push(data.savedNote._id);
    return data.user.save();
  })
  .then(user => {
    if (!user) {
      throw new Error('Failed to update user');
    }
    res.redirect("/");
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("An error occurred.");
  });
  }
});



app.get("/post/:title",requireLogin, function(req, res) {
  let title = req.params.title;
  console.log(title);

  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  User.findById(req.session.userId)
    .populate('posts')
    .exec()
    .then(user => {
      if (!user) {
        throw new Error('User not found');
      }
      let post = user.posts.find(element => element.title === title);
      if (!post) {
        res.status(404).send('Post not found');
      } else {
        res.render("post", { title: post.title, date: post.date, content: post.content });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred.");
    });
});
app.post("/", function(req, res) {
  console.log(req.body);
  const id = new mongoose.Types.ObjectId(req.body.id);
  const action = req.body.action;

  console.log("the id of the note is " + id);
  const userId = new mongoose.Types.ObjectId(req.session.userId);
  console.log("the user id is " + userId);
  console.log("the id being passed is ");
  console.log(`Action: ${action}, ID: ${id}, User ID: ${userId}`);

  if (action === "delete") {
    // Find user and check if post id exists in user's posts
    User.findById(userId)
      .then(user => {
        if (user && user.posts.includes(id)) {
          // If post exists, delete it from Note collection
          Note.findByIdAndDelete(id)
            .then(() => {
              // Update user's posts array
              User.findByIdAndUpdate(userId, { $pull: { posts: id } }, { new: true, useFindAndModify: false })
                .then(updatedUser => {
                  res.redirect("/");
                });
            })
            .catch(err => {
              console.error('Error during Note deletion:', err);
              res.status(500).json({ error: err.toString() });
            });
        } else {
          res.status(404).json({ error: "No matching user post found" });
        }
      })
      .catch(err => {
        console.error('Error during User search:', err);
        res.status(500).json({ error: err.toString() });
      });
  } else {
    res.redirect("/edit/"+id);
    // Handle other actions
  }
});
app.get("/edit/:objectid",requireLogin, async function(req, res) {
  let id = req.params.objectid;

  try {
    const note = await Note.findById(id);
    if (!note) {
      console.log("No note found with the given id");
      // Consider sending a 404 response or rendering a not-found page
      return res.status(404).send("No note found");
    }
    // Only render the page if a note is found
    res.render("edit", {title: note.title, text: note.content,id:note._id});
  } catch (err) {
    console.log(err);
    // Consider sending an error response or rendering an error page
    return res.status(500).send(err);
  }
});
app.post("/edit/:id",requireLogin, async function(req,res){
  let date = new Date();
  let options = { weekday: 'short', day: 'numeric', month: 'long' };
  let formattedDate = date.toLocaleDateString('en-US', options);
  let id = req.params.id;
  let note;
  try {
    note = await Note.findById(id);
    if (!note) {
      console.log("No note found with the given id");
      return res.status(404).send("No note found");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }

  if (req.body.action === 'generate_ai') {
    console.log("WE ARE USING AI");
    if (!req.body.Prompt) {
      return res.status(400).send("No prompt provided in request.");
    }

    generateText(req.body.Prompt, async function(err, generatedText) {
      if (err) {
        console.error(err);
        return res.status(500).send("An error occurred while generating text.");
      }
      
      console.log(generatedText);
      prompts = generatedText;
      note.content = req.body.contentOfPost + prompts;
    
      try {
        await note.save();
        res.redirect("/edit/"+note._id);
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    });
  } else{
    note.date = formattedDate;
    note.content = req.body.contentOfPost
    try {
      await note.save();
     
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.redirect("/");
  }
});
///mongodb+srv://teaghan:peopleeat8Apples@notesai.byyoqhf.mongodb.net/NOTESAI?retryWrites=true&w=majority
app.get("/Get-started",function(req,res){
    res.render("start");

})
app.get("/contact",function(req,res){
  res.render("contact");

})
































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
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Check if the provided password matches the stored password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).render('login', { error: 'An error occurred' });
      }

      if (!result) {
        return res.render('login', { error: 'Invalid username or password' });
      }

      // Store the user ID in the session
      req.session.userId = user._id;

      // Redirect to the dashboard or desired page
      res.redirect('/');
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('login', { error: 'An error occurred' });
  }
});



// Render the signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup form submission
// Handle signup form submission
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'User already exists: try another username or login' });
    }

    // Hash the password before storing it
    bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
      if (err) {
        console.log(err);
        return res.status(500).render('signup', { error: 'An error occurred' });
      }

      // Create a new user with the hashed password
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();

      // Store the user ID in the session
      req.session.userId = newUser._id;

      // Redirect to the dashboard or desired page
      res.redirect('/');
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('signup', { error: 'An error occurred' });
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


// ...
app.post("/sort", function(req, res){
  let sortOption = req.body['sort-option'];

  if (req.session.userId) {
    User.findById(req.session.userId)
      .populate('posts')
      .exec()
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        if (sortOption === "date"){
          // sort by date (newest first)
          user.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortOption === "date-oldest"){
          // sort by date (oldest first)
          user.posts.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortOption === "title"){
          // sort by title A-Z
          user.posts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "title-reverse"){
          // sort by title Z-A
          user.posts.sort((a, b) => b.title.localeCompare(a.title));
        }

        res.render("home", { posts: user.posts });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("An error occurred.");
      });
  } else {
    res.redirect('/login');
  }
});
app.get("/contact",function(req,res){
  res.render("contact");
})
app.post('/search', function(req, res) {
  var searchTerm = req.body.searchvalue;

  if (req.session.userId) {
    User.findById(req.session.userId)
      .populate('posts')
      .exec()
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        let searchResults = user.posts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));

        res.render('home', { posts: searchResults });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("An error occurred.");
      });
  } else {
    res.redirect('/login');
  }
});
function redirectHomeIfLoggedIn(req, res, next) {
  if (req.session.userId) {
    res.redirect('/');
  } else {
    next();
  }
}
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    res.redirect('/signup');
  } else {
    next();
  }
}



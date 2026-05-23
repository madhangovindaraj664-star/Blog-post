const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Save images to 'public/uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Mongoose Schema
const postSchema = mongoose.Schema({
  title: String,
  content: String,
  image: String // Add image field
});

const Post = mongoose.model("Post", postSchema);

// HOME PAGE
app.get("/", (req, res) => {
  Post.find({}, function(err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  });
});

// ABOUT PAGE
app.get("/about", (req, res) => {
  res.render("about", {
    aboutContent: aboutContent
  });
});

// CONTACT PAGE
app.get("/contact", (req, res) => {
  res.render("contact", {
    contactContent: contactContent
  });
});

// COMPOSE PAGE
app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", upload.single('postImage'), (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    image: req.file ? req.file.filename : undefined // Save the filename if an image was uploaded
  });

  post.save(function(err) {
    if (err) {
      console.error("Error saving post:", err);
      return res.status(500).send("Error saving post");
    }
    res.redirect("/");
  });
});

// POSTS PAGE
app.get("/posts/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function(err, post) {
    if (err) {
      console.error("Error finding post:", err);
      return res.status(500).send("Error finding post");
    }
    res.render("post", {
      title: post.title,
      content: post.content,
      image: post.image // Pass the image field to the template
    });
  });
});

// DELETE POST
app.post("/delete/:postId", (req, res) => {
  const postId = req.params.postId;

  Post.findByIdAndRemove(postId, function(err) {
    if (err) {
      console.error("Error deleting post:", err);
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

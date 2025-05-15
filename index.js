import express from "express";
import { readFile, writeFile } from "fs/promises";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Route to show the form for creating a new blog
app.get("/createBlog", (req, res) => {
  res.render("createBlog.ejs");
});

// Route to handle blog submission
app.post("/submit", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const blogs = JSON.parse(data);
    
    // Generate a unique ID (find the highest ID and add 1)
    const maxId = blogs.reduce((max, blog) => Math.max(max, blog.id || 0), 0);
    const newId = maxId + 1;
    
    const blogEntry = {
      id: newId,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      createdAt: new Date().toISOString()
    };
    
    blogs.push(blogEntry);
    
    await writeFile("./data/blogs.json", JSON.stringify(blogs, null, 2), "utf8");
    res.redirect("/readBlog");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing your request");
  }
});

// Route to display all blogs
app.get("/readBlog", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const blogData = JSON.parse(data);
    res.render("readBlog.ejs", { blogData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading blogs");
  }
});

// Route to display a single blog
app.get("/readBlog/:id", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const allBlogs = JSON.parse(data);
    const blogId = parseInt(req.params.id);
    
    const reqBlog = allBlogs.find(blog => blog.id === blogId);
    
    if (!reqBlog) {
      return res.status(404).send("Blog not found");
    }
    
    res.render("showBlog.ejs", { blogData: reqBlog });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing blog data");
  }
});

// Route to show the edit form
app.get("/editBlog/:id", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const allBlogs = JSON.parse(data);
    const blogId = parseInt(req.params.id);
    
    const blog = allBlogs.find(blog => blog.id === blogId);
    
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    
    res.render("editBlog.ejs", { blogData: blog });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing blog data");
  }
});

// Route to handle the update
app.post("/updateBlog/:id", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const allBlogs = JSON.parse(data);
    const blogId = parseInt(req.params.id);
    const blogIndex = allBlogs.findIndex(blog => blog.id === blogId);
    
    if (blogIndex === -1) {
      return res.status(404).send("Blog not found");
    }
    
    // Update the blog but keep the id and creation date
    allBlogs[blogIndex] = {
      id: blogId,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      createdAt: allBlogs[blogIndex].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    await writeFile("./data/blogs.json", JSON.stringify(allBlogs, null, 2), "utf8");
    res.redirect("/readBlog/" + blogId);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating blog");
  }
});

// Route to handle deletion
app.post("/deleteBlog/:id", async (req, res) => {
  try {
    const data = await readFile("./data/blogs.json", "utf8");
    const allBlogs = JSON.parse(data);
    const blogId = parseInt(req.params.id);
    
    const updatedBlogs = allBlogs.filter(blog => blog.id !== blogId);
    
    await writeFile("./data/blogs.json", JSON.stringify(updatedBlogs, null, 2), "utf8");
    res.redirect("/readBlog");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting blog");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import fs from "fs";
import { title } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// In order to use files like images or style.css from public/
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/readBlog", (req, res) => {
  let blogData = 0;
  // Reading data from ./data/blogs.json
  fs.readFile("./data/blogs.json", "utf8", (err, data) => {
    if (err) throw err;
    blogData = data;
    // parsing the obtained string as json data
    blogData = JSON.parse(blogData);
    // console.log(blogData);
    res.render("readBlog.ejs", { blogData: blogData })
  })
})

app.get("/createBlog", (req, res) => {
  res.render("createBlog.ejs")
})

app.post("/submit", (req, res) => {
  // console.log(req.body);
  let idEntry = 0;

  fs.readFile("./data/blogs.json", "utf8", (err, data) => {
    data = JSON.parse(data);
    idEntry = data.length + 1;
    let blogEntry = {
      id: idEntry,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      createdAt: new Date()
    }
    data.push(blogEntry);
    // console.log(data)
    fs.writeFile("./data/blogs.json", JSON.stringify(data), "utf8", (writeErr) => {
      if (writeErr) throw writeErr;
      res.redirect("/readBlog")
    });
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
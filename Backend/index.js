const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const port = 3000;

const app = express();

// Middleware for the app
app.use(express.json());
app.use(cors());

// Schema definition
const urlSchema = new mongoose.Schema({
  shortUrl: {
    type: String,
    unique: true,
    required: true,
  },
  originalUrl: {
    type: String,
    unique: true,
    required: true,
  },
  noOfClicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const URL = mongoose.model("URL", urlSchema);

mongoose.connect("mongodb://localhost:27017/URL_Shortner");

app.get("/all", async (req, res) => {
  try {
    const urlResult = await URL.find({});
    return res.json(urlResult);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

//redirecting based on the short url
app.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await URL.findOne({ shortUrl: id });

    if (!result) {
      return res.status(404).send(`No URL found for shortUrl: ${id}`);
    }

    result.noOfClicks++;
    await result.save();

    return res.redirect(result.originalUrl);
  } catch (err) {
    console.error("Error fetching short URL:", err);
    return res.status(500).send("Server error");
  }
});

//making a short url out of a long one or "the actual url shortner"
app.post("/url:originalUrl", async (req, res) => {
  const originalUrl = req.body.originalUrl;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }

  try {
    const short = nanoid(8); 

    const newUrl = new URL({
      shortUrl: short,
      originalUrl: originalUrl,
      noOfClicks: 0,
      createdAt: new Date(),
    });

    await newUrl.save(); 

    return res.status(201).json({ shortUrl: short });
  } catch (error) {
    console.error("server error biatchhh", error);
    return res.status(500).send("Server error");
  }
});

app.listen(port, (err) => {
  if (err) {
    console.log("Server has an ERROR 😱");
    throw err;
  }

  console.log("startedddddd 🤯 ");
});

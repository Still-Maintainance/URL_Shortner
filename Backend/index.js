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
    console.error("Error fetching all URLs:", error); // Added more specific logging
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

    // Ensure the originalUrl has a protocol for successful redirection
    if (!result.originalUrl.startsWith('http://') && !result.originalUrl.startsWith('https://')) {
        return res.redirect(`http://${result.originalUrl}`); // Prepend http:// if missing
    }

    return res.redirect(result.originalUrl);
  } catch (err) {
    console.error("Error fetching or redirecting short URL:", err); // More specific logging
    return res.status(500).send("Server error");
  }
});

//making a short url out of a long one or "the actual url shortner"
// CORRECTED: Removed ":originalUrl" from the path.
app.post("/url", async (req, res) => {
  const originalUrl = req.body.originalUrl;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }

  try {
    // Check if original URL already exists to prevent duplicates and unique constraint errors
    let existingUrl = await URL.findOne({ originalUrl: originalUrl });
    if (existingUrl) {
      return res.status(200).json({ // Use 200 OK since it's not a new creation
        message: "URL already shortened",
        shortUrl: existingUrl.shortUrl
      });
    }

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
    // More robust error handling for duplicate shortUrl (highly unlikely with nanoid)
    // or other database errors.
    console.error("Error creating short URL:", error);
    // Specifically check for duplicate key error if needed, but generic 500 is fine for now
    if (error.code === 11000) { // MongoDB duplicate key error code
        return res.status(409).json({ error: "A URL with this original or short URL already exists." });
    }
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
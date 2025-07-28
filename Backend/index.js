const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

app.get('/:id', async (req, res) => {
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

app.post('/url' , (req,res)=>{
  
})


app.listen(port, (err) => {
  if (err) {
    console.log("Server has an ERROR 😱");
    throw err;
  }

  console.log("startedddddd 🤯 ");
});

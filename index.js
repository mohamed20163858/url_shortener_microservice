require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const app = express();
function isValidURL(url) {
  const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
  return urlPattern.test(url);
}
// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const urlShorterSchema = new mongoose.Schema({
  shortUrl: Number,
  originalUrl: String
})

let UrlShorter = mongoose.model("UrlShorter", urlShorterSchema);
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;
  if(isValidURL(originalUrl))
  {
    const check = await UrlShorter.exists({ originalUrl:  originalUrl}, { new: true});
    let obj;
    let Url;
    console.log("check: ", check);
    if(check) {
      Url = await UrlShorter.findById(check);
      obj = {original_url: originalUrl, shorter_url: Url.shortUrl }
    }
    else {
      const count = await UrlShorter.countDocuments();
      obj = {original_url: originalUrl, shorter_url: count}
      await UrlShorter.create({originalUrl: originalUrl, shortUrl: count});
    }
    res.json(obj);
  } else {
    res.json({ error: 'invalid url' });
  }

});

app.get("/api/shorturl/:id", async (req, res) => {
  const id = req.params.id;
  if(id == Number(id)){
    const url =  await UrlShorter.findOne({shortUrl: id});
  if(url) {
    res.redirect(url.originalUrl);
  }
  else {
    res.redirect("/");
  }
  }
  else {
    res.json({error: "wrong params"});
  }
  
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

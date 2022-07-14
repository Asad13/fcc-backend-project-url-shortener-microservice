require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}));

const urlSchema = new mongoose.Schema({
  original_url: {type: String,required: true},
  short_url: {type: Number,required: true}
});

const Url = mongoose.model('Url',urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',(req,res) => {
  let baseURL;
  if(req.body.url.split("/").length > 1){
    baseURL = new URL(req.body.url).origin.split("//")[1]
  }else{
    baseURL = req.body.url;
  }
  dns.lookup(baseURL, async (err,address,family) => {
    if(err) res.json({ error: 'invalid url' });
    let shortValue = await Url.find().countDocuments();
    shortValue += 1;
    const url = new Url({original_url: req.body.url,short_url: shortValue});
    try {
      await url.save();
      res.json({original_url: req.body.url,short_url: shortValue});
    } catch (error) {
      res.json({ error: 'error' });
    }
  });
});

app.get('/api/shorturl/:short_url',async (req,res) => {
  const url = await Url.findOne({short_url: parseInt(req.params.short_url)});
  res.redirect(url.original_url);
  //res.end();
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

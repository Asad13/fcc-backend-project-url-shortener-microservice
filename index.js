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
  dns.lookup(req.body.url, async (err,address,family) => {
    if(err) res.json({ error: 'invalid url' });
    let shortValue = await Url.find().countDocuments();
    shortValue += 1;
    const url = new Url({original_url: req.body.url,short_url: shortValue});
    try {
      await url.save();
      res.json({original_url: url.original_url,short_url: url.short_url});
    } catch (error) {
      res.json({ error: 'error' });
    }
  });
});

app.get('/api/shorturl/:short_url',(req,res) => {
  const url = Url.findOne({short_url: req.params.short_url}).original_url;
  res.redirect(url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-Memory Database and Counter
let urlDatabase = [];
let urlCounter = 1;

// URL Shortener POST endpoint
app.post('/api/shorturl', (req, res) => {
  console.log(req.body); // Log the incoming request body
  const url = req.body.url;

  // Use URL constructor for robust URL parsing
  let hostname;
  try {
    const urlObject = new URL(url);
    hostname = urlObject.hostname;
    console.log('Parsed hostname:', hostname); // Log the parsed hostname
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      console.log('DNS lookup failed:', err); // Log the DNS lookup error
      return res.json({ error: 'invalid url' });
    }
    
    const shortUrl = urlCounter++;
    urlDatabase.push({ original_url: url, short_url: shortUrl });
    
    res.json({ original_url: url, short_url: shortUrl });
  });
});

// URL Shortener GET endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

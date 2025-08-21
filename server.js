const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

const fs = require('fs');
app.get('/adsb', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'data', 'adsb_sample.json'));
});


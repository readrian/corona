const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));



app.get('/api', async (request, response) => {
  const de_url = `https://api.covid19api.com/dayone/country/germany`;
  const sum_url = `https://api.covid19api.com/summary`;
  const de_response = await fetch(de_url);
  const sum_response = await fetch(sum_url);
  const de_data = await de_response.json();
  const sum_data = await sum_response.json();
  response.json({ de_data, sum_data })
})
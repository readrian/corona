const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));



app.get('/api', async (request, response) => {
  const aq_url = `https://api.covid19api.com/dayone/country/germany`;
  const aq_response = await fetch(aq_url);
  const aq_data = await aq_response.json();
  console.log(aq_data)
  response.json(aq_data)
})
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));



app.get('/api', async (request, response) => {
  const de_url = `https://api.covid19api.com/dayone/country/germany`;
  const sum_url = `https://api.covid19api.com/summary`;
  const deIncident_url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json`;
  const de_response = await fetch(de_url);
  const sum_response = await fetch(sum_url);
  const deIncident_response = await fetch(deIncident_url);
  const de_data = await de_response.json();
  const sum_data = await sum_response.json();
  const deIncident_data = await deIncident_response.json();
  response.json({ de_data, sum_data, deIncident_data })
})
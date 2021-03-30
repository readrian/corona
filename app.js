const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening at ${port}`));
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


  let deathsM = [2, 3, 31, 87, 276, 1397, 4047, 9315, 17499, 5780]
  let deathsF = [6, 0, 21, 50, 137, 578, 1778, 5197, 17199, 11349]


  let ageGroup = ['0 - 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '90+']

  let deathsAgeSex = {
    deaths: {
      deathsM,
      deathsF
    },
    ageGroup
  }

  response.json({ de_data, sum_data, deIncident_data, deathsAgeSex })
})
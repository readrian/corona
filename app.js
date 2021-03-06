const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const { json } = require('express');

function jsonReader(filePath, cb) {
  fs.readFile(filePath, 'utf-8', (err, fileData) => {
    if (err) {
      return cb && cb(err)
    }
    try {
      const object = JSON.parse(fileData)
      return cb && cb(null, object)
    } catch (err) {
      return cb && cb(err)
    }
  })
}

getAPI()
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

let timeStamp


function lastSync() {
  let currentdate = new Date();
  let datetime = "Last Sync: " + currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
  return datetime
}

let dayInMilliseconds = 1000 * 60 * 60
setInterval(function () { getAPI(); }, dayInMilliseconds);

let de_data
let sum_data
let deIncident_data
let deGes_data
let owid_data
let inzPrevDay



async function getAPI() {
  try {
    const de_url = `https://api.covid19api.com/dayone/country/germany`;
    const sum_url = `https://api.covid19api.com/summary`;
    const deIncident_url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json`;
    const deGes_url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_key_data_hubv/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json`
    const owid_url = `https://covid.ourworldindata.org/data/owid-covid-data.json`

    const de_response = await fetch(de_url);
    const sum_response = await fetch(sum_url);
    const deIncident_response = await fetch(deIncident_url);
    const deGes_response = await fetch(deGes_url);
    const owid_response = await fetch(owid_url);

    let de_data_temp = await de_response.json();
    let sum_data_temp = await sum_response.json();
    let deIncident_data_temp = await deIncident_response.json();
    let deGes_data_temp = await deGes_response.json();
    let owid_temp = await owid_response.json();
    let timeStamp_temp = lastSync()

    if (sum_data_temp.Global.TotalConfirmed !== 0 && de_data_temp !== undefined) {
      de_data = de_data_temp
      sum_data = sum_data_temp
      deIncident_data = deIncident_data_temp
      timeStamp = timeStamp_temp
      deGes_data = deGes_data_temp
      owid_data = owid_temp.DEU.data

      jsonReader('inzidenz.json', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          inzPrevDay = data.oldInc
          if (data.newTotal !== deGes_data.features[0].attributes.AnzFall) {
            const lastInz = {
              oldTotal: data.newTotal,
              oldInc: data.newInc,
              newTotal: deGes_data.features[0].attributes.AnzFall,
              newInc: deGes_data.features[0].attributes.Inz7T,
            };
            const jsonString = JSON.stringify(lastInz)

            fs.writeFile('inzidenz.json', JSON.stringify(lastInz), err => {
              if (err) {
                console.log(err);
              } else {
                console.log('File successfully written!');
              }
            })
            inzPrevDay = data.oldInc
            console.log('kleiner')
          }
        }
      })

      setTimeout(function () {
        jsonReader('inzidenz.json', (err, data) => {
          if (err) {
            console.log(err)
          } else {
            inzPrevDay = data.oldInc
          }
        })
      }, 50);

      console.log('syncinc...')
    } else {
      console.warn('Tried syncing, but received invalid response')
    }
  } catch (error) {
    console.warn(`Tried syncing, but received invalid response: ${error}`)
  }

}



let deathsM = [6394, 19949, 11430, 5340, 1962, 424, 144, 46, 5, 4]
let deathsF = [12346, 19312, 6441, 2319, 803, 204, 74, 27, 3, 8]

let ageGroup = ['90+', '89 - 80', '79 - 70', '69 - 60', '59 - 50', '49 - 40', '39 - 30', '29 - 20', '19 - 10', '9 - 0']

let deathsAgeSex = {
  deaths: {
    deathsM,
    deathsF
  },
  ageGroup
}

app.get('/api', async (request, response) => {


  response.json({ de_data, sum_data, deIncident_data, deathsAgeSex, timeStamp, deGes_data, owid_data, inzPrevDay })
})
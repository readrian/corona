setup()

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function makeChart(covid, id, label, path, color, type, xAsis) {
  const mtx = document.getElementById(id).getContext('2d');
  const myChartNew = new Chart(mtx, {
    type: type,
    data: {
      labels: xAsis,
      datasets: [
        {
          label: label,
          data: path,
          fill: true,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 1,
          pointRadius: 0,
        }
      ]
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var value = data.datasets[0].data[tooltipItem.index];
            value = value.toString();
            value = value.split(/(?=(?:...)*$)/);
            value = value.join('.');
            return value;
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            userCallback: function (value, index, values) {
              // Convert the number to a string and splite the string every 3 charaters from the end
              value = value.toString();
              value = value.split(/(?=(?:...)*$)/);
              value = value.join('.');
              return value;
            }
          }
        }],
        xAxes: [{
          ticks: {
            autoSkip: true,
            maxTicksLimit: 15
          }
        }]
      },
      tooltips: {
        cornerRadius: 0,
        caretSize: 0,
        xPadding: 16,
        yPadding: 10,
        backgroundColor: 'rgba(12, 12, 12, 0.9)',
        titleFontStyle: 'normal',
        titleMarginBottom: 15,
      }
    }
  });
}

async function setup() {
  const covid = await getData();
  document.getElementById('totalInfGlobal').innerHTML = `Weltweite Infektionen: ${numberWithCommas(covid.global.Global.TotalConfirmed)}`;
  document.getElementById('totalDeathGlobal').innerHTML = `Weltweite Tode: ${numberWithCommas(covid.global.Global.TotalDeaths)}`;
  document.getElementById('totalRecGlobal').innerHTML = `Weltweit genesen: ${numberWithCommas(covid.global.Global.TotalRecovered)}`;
  makeChart(covid, 'infectionsDE', 'Covid Infections Germany', covid.infData, 'rgba(255, 99, 132, 1)', 'line', covid.date)
  makeChart(covid, 'infectionsDEInc', 'Covid Infections Germany Incremental', covid.infDataInc, 'rgba(255, 99, 132, 1)', 'bar', covid.date)
  makeChart(covid, 'deathDE', 'Covid Deaths Germany', covid.death, 'rgba(12, 12, 12, 1)', 'line', covid.date)
  makeChart(covid, 'deathDEInc', 'Covid Deaths Germany Incremental', covid.deathInc, 'rgba(12, 12, 12, 1)', 'bar', covid.date)
}

async function getData() {
  const response = await fetch('/api');
  let data = await response.json();
  console.log(data)
  let infData = []
  let infDataInc = []
  let date = []
  let death = []
  let deathInc = []
  let global = data.sum_data
  let weekNumber = []

  for (let i = 0; i < data.de_data.length; i++) {
    infData.push(data.de_data[i].Confirmed)

    let day = data.de_data[i].Date.split(/[T-]+/)
    date.push(`${day[2]}.${day[1]}.${day[0]}`)

    death.push(data.de_data[i].Deaths)

    if (i === 0)
      deathInc.push(0)
    else {
      let temp = 0
      if (deathInc[i - 1] < 0) {
        temp = deathInc[i - 1]
        deathInc[i - 1] = 0
      }
      deathInc.push(data.de_data[i].Deaths - data.de_data[i - 1].Deaths + Math.abs(temp))
    }

    if (i === 0)
      infDataInc.push(0)
    else {
      let temp = 0
      if (infDataInc[i - 1] < 0) {
        temp = infDataInc[i - 1]
        infDataInc[i - 1] = 0
      }
      infDataInc.push(data.de_data[i].Confirmed - data.de_data[i - 1].Confirmed + Math.abs(temp))
    }

    weekNumber.push(moment(date[i], "DD-MM-YYYY").week())

  }

  // console.log(date)
  // console.log(infData)
  // console.log(death)
  console.log(weekNumber)
  console.log(deathInc)
  // console.log(infDataInc)

  return { date, infData, death, global, weekNumber, deathInc, infDataInc }
}


var map = L.map('map').setView([51.5, 10.3], 5.5);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>Deutschland Covid19 Inzidenzwert</h4>' + (props ?
    '<b>' + props.name + '</b><br />' + 'Inzidenzwert: ' + props.density + '</sup>'
    : 'Über Bundesland fahren');
};

info.addTo(map);


// get color depending on population density value
function getColor(d) {
  return d > 1000 ? '#800026' :
    d > 500 ? '#BD0026' :
      d > 200 ? '#E31A1C' :
        d > 100 ? '#FC4E2A' :
          d > 50 ? '#FD8D3C' :
            d > 20 ? '#FEB24C' :
              d > 10 ? '#FED976' :
                '#FFEDA0';
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.density)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('Inzidenz Daten von &copy; <a href="https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0/geoservice">COVID-19 Datenhub</a>');


var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i]; to = grades[i + 1]; labels.push('<i style="background:' +
      getColor(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
  } div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
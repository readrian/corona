let data
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
            let value = data.datasets[0].data[tooltipItem.index];
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

function makeDoubleChart(covid, id, label, path, color, type, xAsis, pathF) {
  const ctx = document.getElementById(id).getContext('2d');
  const myChartNew = new Chart(ctx, {
    type: type,
    data: {
      labels: xAsis,
      datasets: [
        {
          label: 'Covid Tode nach Alter Männer',
          data: path,
          fill: true,
          borderColor: 'rgba(12, 12, 12, 0.9)',
          backgroundColor: 'rgba(12, 12, 12, 0.9)',
          borderWidth: 1,
          pointRadius: 0,
        }, {
          label: 'Covid Tode nach Alter Frauen',
          data: pathF,
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
      },
      "animation": {
        "duration": 1,
        "onComplete": function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;

          ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              ctx.fillText(data, bar._model.x + 20, bar._model.y + 7);
            });
          });
        }
      },
    },
  });
}

async function setup() {
  const covid = await getData();
  document.getElementById('totalInfGlobal').innerHTML = `Weltweite Infektionen: ${numberWithCommas(covid.global.Global.TotalConfirmed)}`;
  document.getElementById('totalDeathGlobal').innerHTML = `Weltweite Tode: ${numberWithCommas(covid.global.Global.TotalDeaths)}`;
  document.getElementById('totalRecGlobal').innerHTML = `Weltweit genesen: ${numberWithCommas(covid.global.Global.TotalRecovered)}`;
  makeChart(covid, 'infectionsDE', 'Covid Infections Germany', covid.infData, 'rgba(255, 99, 132, 1)', 'line', covid.date)
  console.log(covid)
  makeDoubleChart(covid, 'deathsAge', 'Covid Tote nach Alter und Geschlecht', covid.deathsAgeSex.deaths.deathsM, 'rgba(255, 99, 132, 1)', 'horizontalBar', covid.deathsAgeSex.ageGroup, covid.deathsAgeSex.deaths.deathsF)
  makeChart(covid, 'infectionsDEInc', 'Covid Infections Germany Incremental', covid.infDataInc, 'rgba(255, 99, 132, 1)', 'bar', covid.date)
  makeChart(covid, 'deathDE', 'Covid Deaths Germany', covid.death, 'rgba(12, 12, 12, 1)', 'line', covid.date)
  makeChart(covid, 'deathDEInc', 'Covid Deaths Germany Incremental', covid.deathInc, 'rgba(12, 12, 12, 1)', 'bar', covid.date)


  let map = L.map('map', {
    wheelPxPerZoomLevel: 200,
    zoomDelta: 0.5,
    zoomSnap: 0.01,
  }).setView([51.2, 10.3], 5.45);

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
  let info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    let wertInzidenz
    let wertInzidenzAbs
    let wertTodAbs
    try {
      switch (props.name) {
        case 'Schleswig-Holstein':
          wertInzidenz = data.deIncident_data.features[0].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[0].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[0].attributes.death7_bl
          break;
        case 'Hamburg':
          wertInzidenz = data.deIncident_data.features[1].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[1].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[0].attributes.death7_bl
          break;
        case 'Niedersachsen':
          wertInzidenz = data.deIncident_data.features[2].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[2].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[2].attributes.death7_bl
          break;
        case 'Bremen':
          wertInzidenz = data.deIncident_data.features[3].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[3].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[3].attributes.death7_bl
          break;
        case 'Nordrhein-Westfalen':
          wertInzidenz = data.deIncident_data.features[4].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[4].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[4].attributes.death7_bl
          break;
        case 'Hessen':
          wertInzidenz = data.deIncident_data.features[5].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[5].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[5].attributes.death7_bl
          break;
        case 'Rheinland-Pfalz':
          wertInzidenz = data.deIncident_data.features[6].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[6].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[6].attributes.death7_bl
          break;
        case 'Baden-Württemberg':
          wertInzidenz = data.deIncident_data.features[7].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[7].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[7].attributes.death7_bl
          break;
        case 'Bayern':
          wertInzidenz = data.deIncident_data.features[8].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[8].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[8].attributes.death7_bl
          break;
        case 'Saarland':
          wertInzidenz = data.deIncident_data.features[9].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[9].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[9].attributes.death7_bl
          break;
        case 'Berlin':
          wertInzidenz = data.deIncident_data.features[10].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[10].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[10].attributes.death7_bl
          break;
        case 'Brandenburg':
          wertInzidenz = data.deIncident_data.features[11].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[11].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[11].attributes.death7_bl
          break;
        case 'Mecklenburg-Vorpommern':
          wertInzidenz = data.deIncident_data.features[12].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[12].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[12].attributes.death7_bl
          break;
        case 'Sachsen':
          wertInzidenz = data.deIncident_data.features[13].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[13].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[13].attributes.death7_bl
          break;
        case 'Sachsen-Anhalt':
          wertInzidenz = data.deIncident_data.features[14].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[14].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[14].attributes.death7_bl
          break;
        case 'Thüringen':
          wertInzidenz = data.deIncident_data.features[15].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[15].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[15].attributes.death7_bl
          break;
      }
    } catch { }
    this._div.innerHTML = '<h4>Deutschland Covid19 Daten</h4>' + (props ?
      '<b>' + props.name + '</b><br /><b>' + wertInzidenz.toFixed(2).replace('.', ',') + '</b>' + ' (Inzidenzwert)' + '<br />' + '<b>' + numberWithCommas(wertInzidenzAbs) + '</b >' + ' (Fälle letzte 7 Tage)' + '<br /><b>' + numberWithCommas(wertTodAbs) + '</b>' + ' (Tode letzte 7 Tage)' + '</sup > '
      : 'Über Bundesland fahren');
    console.log(wertInzidenz)
  };

  info.addTo(map);


  // get color depending on population density value
  function getColor(d) {
    return d > 250 ? '#800026' :
      d > 200 ? '#BD0026' :
        d > 170 ? '#E31A1C' :
          d > 130 ? '#FC4E2A' :
            d > 100 ? '#FD8D3C' :
              d > 50 ? '#FEB24C' :
                d > 30 ? '#FED976' :
                  '#FFEDA0';
  }

  function style(feature) {
    let wert
    try {
      switch (feature.properties.name) {
        case 'Schleswig-Holstein':
          wert = data.deIncident_data.features[0].attributes.cases7_bl_per_100k
          break;
        case 'Hamburg':
          wert = data.deIncident_data.features[1].attributes.cases7_bl_per_100k
          break;
        case 'Niedersachsen':
          wert = data.deIncident_data.features[2].attributes.cases7_bl_per_100k
          break;
        case 'Bremen':
          wert = data.deIncident_data.features[3].attributes.cases7_bl_per_100k
          break;
        case 'Nordrhein-Westfalen':
          wert = data.deIncident_data.features[4].attributes.cases7_bl_per_100k
          break;
        case 'Hessen':
          wert = data.deIncident_data.features[5].attributes.cases7_bl_per_100k
          break;
        case 'Rheinland-Pfalz':
          wert = data.deIncident_data.features[6].attributes.cases7_bl_per_100k
          break;
        case 'Baden-Württemberg':
          wert = data.deIncident_data.features[7].attributes.cases7_bl_per_100k
          break;
        case 'Bayern':
          wert = data.deIncident_data.features[8].attributes.cases7_bl_per_100k
          break;
        case 'Saarland':
          wert = data.deIncident_data.features[9].attributes.cases7_bl_per_100k
          break;
        case 'Berlin':
          wert = data.deIncident_data.features[10].attributes.cases7_bl_per_100k
          break;
        case 'Brandenburg':
          wert = data.deIncident_data.features[11].attributes.cases7_bl_per_100k
          break;
        case 'Mecklenburg-Vorpommern':
          wert = data.deIncident_data.features[12].attributes.cases7_bl_per_100k
          break;
        case 'Sachsen':
          wert = data.deIncident_data.features[13].attributes.cases7_bl_per_100k
          break;
        case 'Sachsen-Anhalt':
          wert = data.deIncident_data.features[14].attributes.cases7_bl_per_100k
          break;
        case 'Thüringen':
          wert = data.deIncident_data.features[15].attributes.cases7_bl_per_100k
          break;
      }
    } catch { console.log('error') }
    console.log(data)
    // console.log(wert)
    return {
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
      fillColor: getColor(wert)
    };
  }

  function highlightFeature(e) {
    let layer = e.target;

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

  let geojson;

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

  map.attributionControl.addAttribution('Daten von &copy; <a href="https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0/geoservice">COVID-19 Datenhub</a>');


  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 30, 50, 100, 130, 170, 200, 250],
      labels = [],
      from, to;

    for (let i = 0; i < grades.length; i++) {
      from = grades[i]; to = grades[i + 1]; labels.push('<i style="background:' +
        getColor(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
    } div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);
}

async function getData() {
  const response = await fetch('/api');
  data = await response.json();
  // console.log(data)
  let infData = []
  let infDataInc = []
  let date = []
  let death = []
  let deathInc = []
  let global = data.sum_data
  let weekNumber = []
  let deathsAgeSex = data.deathsAgeSex

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
  return { date, infData, death, global, weekNumber, deathInc, infDataInc, deathsAgeSex }
}



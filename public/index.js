let data
setup()

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function makeChart(covid, id, label, path, color, type, xAsis, bColor) {
  const mtx = document.getElementById(id).getContext('2d');
  var colors = []
  var bColors = []
  for (var i = 0; i < path.length; i++) {
    var colorNew;
    var colorNewB;
    if (path[i] < 1 && id === 'repRate') {
      colorNew = '#52b788'
      colorNewB = '#52b788'
    } else {
      colorNew = color
      colorNewB = bColor
    }
    colors[i] = colorNew
    bColors[i] = colorNewB
  }
  const myChartNew = new Chart(mtx, {
    type: type,
    data: {
      labels: xAsis,
      datasets: [
        {
          label: label,
          data: path,
          fill: true,
          borderColor: colors,
          backgroundColor: bColors,
          borderWidth: 5,
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
          gridLines: {
            display: false
          },
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
      legend: {
        onClick: (e) => e.stopPropagation()
      },
      maintainAspectRatio: false
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
          label: 'Covid Tode nach Alter M??nner',
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
          gridLines: {
            display: false
          },
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
        "duration": 0,
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
              ctx.fillText(data, bar._model.x + 15, bar._model.y + 7);
            });
          });
        }
      },
      legend: {
        onClick: (e) => e.stopPropagation()
      },
      maintainAspectRatio: false
    },
  });
}

async function setup() {
  const covid = await getData();
  console.log(covid)

  document.getElementById('DEGesamt1').innerHTML = `<b>${numberWithCommas(covid.global.Countries[63].TotalConfirmed)}</b>`;
  document.getElementById('DEGesamt2').innerHTML = `<b>${numberWithCommas(covid.global.Countries[63].TotalRecovered)}</b>`;
  document.getElementById('DEGesamt3').innerHTML = `<b>${numberWithCommas(covid.global.Countries[63].TotalDeaths)}</b>`;

  document.getElementById('DENeu1').innerHTML = `<b>+${numberWithCommas(covid.deGes_data.features[0].attributes.AnzFallNeu)}</b>`;
  document.getElementById('DENeu2').innerHTML = `<b>+${numberWithCommas(covid.deGes_data.features[0].attributes.AnzGenesenNeu)}</b>`;
  document.getElementById('DENeu3').innerHTML = `<b>+${numberWithCommas(covid.deGes_data.features[0].attributes.AnzTodesfallNeu)}</b>`;

  let temp4 = covid.deGes_data.features[0].attributes.Inz7T
  temp4 = temp4.toString()
  temp4 = temp4.replace('.', ',')
  document.getElementById('inz1').innerHTML = `<b>${temp4}</b>`;
  let temp5 = covid.inzPrevDay
  temp5 = temp5.toString()
  temp5 = temp5.replace('.', ',')
  document.getElementById('inz2').innerHTML = `<b>${temp5}</b>`;
  let prefix
  if (covid.deGes_data.features[0].attributes.Inz7T - covid.inzPrevDay < 0) {
    document.getElementById('inz3').style.backgroundColor = '#d1ffd7'
    prefix = ''
  }
  else {
    document.getElementById('inz3').style.backgroundColor = '#E97F7F'
    prefix = '+'
  }
  temp5 = covid.deGes_data.features[0].attributes.Inz7T - covid.inzPrevDay
  temp5 = temp5.toFixed(1)
  temp5 = temp5.toString()
  temp5 = temp5.replace('.', ',')

  document.getElementById('inz3').innerHTML = `<b>${prefix}${temp5}</b>`;

  let temp1 = covid.owid_data.people_fully_vaccinated_per_hundred
  temp1 = temp1.toString();
  temp1 = temp1.replace('.', ',')
  let temp2 = covid.owid_data.people_vaccinated_per_hundred
  temp2 = temp2.toString();
  temp2 = temp2.replace('.', ',')
  document.getElementById('impf1').innerHTML = `<b>${temp1}%</b>`;
  document.getElementById('impf2').innerHTML = `<b>${temp2}%</b>`;
  document.getElementById('impf3').innerHTML = `<b>${numberWithCommas(covid.owid_data.people_fully_vaccinated)}</b>`;
  let impfStand = covid.owid_data.date.split(/[T-]+/)
  let impfDate = []
  impfDate.push(`${impfStand[2]}.${impfStand[1]}.${impfStand[0]}`)
  document.getElementById('impfStand').innerHTML = `Stand: ${impfDate}</b>`;


  document.getElementById('worldwide1').innerHTML = `<b>${numberWithCommas(covid.global.Global.TotalConfirmed)}</b>`;
  document.getElementById('worldwide2').innerHTML = `<b>${numberWithCommas(covid.global.Global.TotalRecovered)}</b>`;
  document.getElementById('worldwide3').innerHTML = `<b>${numberWithCommas(covid.global.Global.TotalDeaths)}</b>`;
  makeChart(covid, 'infectionsDE', 'Covid Infections Germany', covid.infData, 'rgba(255, 99, 132, 1)', 'line', covid.date, 'rgba(255, 99, 132, 0.5)')
  makeChart(covid, 'repRate', 'R-Wert', covid.rep, 'rgba(255, 99, 132, 1)', 'bar', covid.repDate, 'rgba(255, 99, 132, 1)')
  let temp3 = covid.rep[covid.rep.length - 1]
  temp3 = temp3.toString()
  temp3 = temp3.replace('.', ',')
  document.getElementById('r0Current').innerHTML = `R-Wert: ${temp3}`
  document.getElementById('r0Stand').innerHTML = `Stand: ${covid.repDate[covid.repDate.length - 1]}`
  makeDoubleChart(covid, 'deathsAge', 'Covid Tote nach Alter und Geschlecht', covid.deathsAgeSex.deaths.deathsM, 'rgba(255, 99, 132, 1)', 'horizontalBar', covid.deathsAgeSex.ageGroup, covid.deathsAgeSex.deaths.deathsF)
  makeChart(covid, 'infectionsDEInc', 'Covid Infections Germany Incremental', covid.infDataInc, 'rgba(255, 99, 132, 1)', 'bar', covid.date, 'rgba(255, 99, 132, 1)')
  makeChart(covid, 'deathDE', 'Covid Deaths Germany', covid.death, 'rgba(12, 12, 12, 1)', 'line', covid.date, 'rgba(12, 12, 12, 0.8)')
  makeChart(covid, 'deathDEInc', 'Covid Deaths Germany Incremental', covid.deathInc, 'rgba(12, 12, 12, 1)', 'bar', covid.date, 'rgba(12, 12, 12, 1)')
  console.log(data.timeStamp)
  document.getElementById('lastSync').innerHTML = data.timeStamp

  var southWest = new L.LatLng(47.1, 5.728),
    northEast = new L.LatLng(55.224, 15.275),
    bounds = new L.LatLngBounds(southWest, northEast);

  let map = L.map('map', {
    gestureHandling: true,
    wheelPxPerZoomLevel: 200,
    zoomDelta: 0.5,
    zoomSnap: 0.01,
  }).fitBounds(bounds);



  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery ?? <a href="https://www.mapbox.com/">Mapbox</a>',
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
        case 'Baden-W??rttemberg':
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
        case 'Th??ringen':
          wertInzidenz = data.deIncident_data.features[15].attributes.cases7_bl_per_100k
          wertInzidenzAbs = data.deIncident_data.features[15].attributes.cases7_bl
          wertTodAbs = data.deIncident_data.features[15].attributes.death7_bl
          break;
      }
    } catch { }
    this._div.innerHTML = '<h4 id="explainer">Deutschland Covid19 Daten</h4>' + (props ?
      '<b>' + props.name + '</b><br /><b>' + wertInzidenz.toFixed(2).replace('.', ',') + '</b>' + ' (Inzidenzwert)' + '<br />' + '<b>' + numberWithCommas(wertInzidenzAbs) + '</b >' + ' (F??lle letzte 7 Tage)' + '<br /><b>' + numberWithCommas(wertTodAbs) + '</b>' + ' (Tode letzte 7 Tage)' + '</sup > '
      : '??ber Bundesland fahren');
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
        case 'Baden-W??rttemberg':
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
        case 'Th??ringen':
          wert = data.deIncident_data.features[15].attributes.cases7_bl_per_100k
          break;
      }
    } catch { console.log('error') }
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

  map.attributionControl.addAttribution('Daten von <a href="https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0/geoservice">COVID-19 Datenhub</a>');


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
  console.log(data)
  let infData = []
  let infDataInc = []
  let date = []
  let death = []
  let deathInc = []
  let global = data.sum_data
  let weekNumber = []
  let deathsAgeSex = data.deathsAgeSex
  let deGes_data = data.deGes_data
  let owid_data = data.owid_data
  let rep = []
  let repDate = []
  let inzPrevDay = data.inzPrevDay

  for (let i = 0; i < owid_data.length; i++) {
    if (owid_data[i].reproduction_rate !== undefined) {
      rep.push(owid_data[i].reproduction_rate)
      let day = owid_data[i].date.split(/[T-]+/)
      repDate.push(`${day[2]}.${day[1]}.${day[0]}`)
    }
  }

  for (let i = data.owid_data.length - 1; owid_data.people_fully_vaccinated === undefined; i--) {
    if (data.owid_data[i].people_fully_vaccinated !== undefined) {
      owid_data = data.owid_data[i]
      break;
    }
  }


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
  console.log(inzPrevDay)
  return { date, infData, death, global, weekNumber, deathInc, infDataInc, deathsAgeSex, deGes_data, rep, repDate, owid_data, inzPrevDay }
}



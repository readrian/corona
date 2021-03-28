setup()

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function makeChart(covid, id, label, path, color, type) {
  const mtx = document.getElementById(id).getContext('2d');
  const myChartNew = new Chart(mtx, {
    type: type,
    data: {
      labels: covid.date,
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
      }
    }
  });
}

async function setup() {
  const covid = await getData();
  document.getElementById('totalInfGlobal').innerHTML = `Weltweite Infektionen: ${numberWithCommas(covid.global.Global.TotalConfirmed)}`;
  document.getElementById('totalDeathGlobal').innerHTML = `Weltweite Tode: ${numberWithCommas(covid.global.Global.TotalDeaths)}`;
  document.getElementById('totalRecGlobal').innerHTML = `Weltweit genesen: ${numberWithCommas(covid.global.Global.TotalRecovered)}`;
  makeChart(covid, 'infectionsDE', 'Covid Infections Germany', covid.infData, 'rgba(255, 99, 132, 1)', 'line')
  makeChart(covid, 'infectionsDEInc', 'Covid Infections Germany Incremental', covid.infDataInc, 'rgba(255, 99, 132, 1)', 'bar')
  makeChart(covid, 'deathDE', 'Covid Deaths Germany', covid.death, 'rgba(12, 12, 12, 1)', 'line')
  makeChart(covid, 'deathDEInc', 'Covid Deaths Germany Incremental', covid.deathInc, 'rgba(12, 12, 12, 1)', 'bar')
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
  let deathWeekly = []
  let counter
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
  console.log(infDataInc)
  return { date, infData, death, global, weekNumber, deathInc, infDataInc }
}

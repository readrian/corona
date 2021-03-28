
setup()

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function makeChart(covid, id, label, path, color) {
  const mtx = document.getElementById(id).getContext('2d');
  const myChartNew = new Chart(mtx, {
    type: 'line',
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
  makeChart(covid, 'infectionsDE', 'Covid Infections Germany', covid.infData, 'rgba(255, 99, 132, 1)')
  makeChart(covid, 'deathDE', 'Covid Deaths Germany', covid.death, 'rgba(12, 12, 12, 1)')

  async function getData() {
    const response = await fetch('/api');
    let data = await response.json();
    console.log(data)
    let infData = []
    let date = []
    let death = []
    let global = data.sum_data
    for (let i = 0; i < data.de_data.length; i++) {
      infData.push(data.de_data[i].Confirmed)
      date.push(data.de_data[i].Date.split('T')[0])
      death.push(data.de_data[i].Deaths)
    }
    console.log(date)
    console.log(infData)
    console.log(death)
    return { date, infData, death, global }
  }
}

setup()

async function setup() {
  //Infections
  const itx = document.getElementById('infectionsDE').getContext('2d');
  const covid = await getData();
  const myChartI = new Chart(itx, {
    type: 'line',
    data: {
      labels: covid.date,
      datasets: [
        {
          label: 'Covid Infections Germany',
          data: covid.infData,
          fill: true,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          pointRadius: 0
        }
      ]
    },
    options: {}
  });

  //Deaths
  const dtx = document.getElementById('deathDE').getContext('2d');
  const myChartD = new Chart(dtx, {
    type: 'line',
    data: {
      labels: covid.date,
      datasets: [
        {
          label: 'Covid Deaths Germany',
          data: covid.death,
          fill: true,
          borderColor: 'rgba(12, 12, 12, 1)',
          backgroundColor: 'rgba(12, 12, 12, 1)',
          borderWidth: 1,
          pointRadius: 0
        }
      ]
    },
    options: {}
  });
}


async function getData() {
  const response = await fetch('/api');
  let data = await response.json();
  let infData = []
  let date = []
  let death = []
  for (let i = 0; i < data.length; i++) {
    infData.push(data[i].Confirmed)
    date.push(data[i].Date.split('T')[0])
    death.push(data[i].Deaths)
  }
  console.log(date)
  console.log(infData)
  console.log(death)
  return { date, infData, death }
}




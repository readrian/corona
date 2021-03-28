
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
  console.log(data)
  console.log(data.de_data[1].Confirmed)
  let infData = []
  let date = []
  let death = []
  let length = console.log(data.de_data.length)
  for (let i = 0; i < length; i++) {
    console.log(data.de_data[i].Confirmed)
    infData.push(data.de_data[i].Confirmed)
    date.push(data[i].de_data.Date.split('T')[0])
    death.push(data[i].de_data.Deaths)
  }
  console.log(date)
  console.log(infData)
  console.log(death)
  return { date, infData, death }
}




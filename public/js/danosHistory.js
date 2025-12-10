
const tableTdAverias = document.getElementsByClassName('tableTdAverias')
const tableTdCantidades = document.getElementsByClassName('tableTdCantidades')
const graphStat = document.getElementById('graphStat')
const graphStatLinkBtn = document.getElementById('graphStatLinkBtn')
const graphStatImg = document.getElementById('graphStatImg')

for (let i = 0; i < tableTdAverias.length; i++) {
  switch (tableTdAverias[i].innerText) {
    case tableTdAverias[i].innerText = 'G':
      tableTdAverias[i].innerText = 'G - Rayado'
      break;
    case tableTdAverias[i].innerText = 'M':
      tableTdAverias[i].innerText = 'M - Faltante'
      break;
    case tableTdAverias[i].innerText = 'I':
      tableTdAverias[i].innerText = 'I - Sucio'
      break;
    case tableTdAverias[i].innerText = 'R':
      tableTdAverias[i].innerText = 'R - Raspado'
      break;
    case tableTdAverias[i].innerText = 'K':
      tableTdAverias[i].innerText = 'K - Roto'
      break;
    case tableTdAverias[i].innerText = 'S':
      tableTdAverias[i].innerText = 'S - Pint saltada'
      break;
    case tableTdAverias[i].innerText = 'A':
      tableTdAverias[i].innerText = 'A - Abollado'
      break;
    case tableTdAverias[i].innerText = 'B':
      tableTdAverias[i].innerText = 'B - Doblado'
      break;

    case tableTdAverias[i].innerText = '18':
      tableTdAverias[i].innerText = '18 - Guardabarro del izquierdo'
      break;
    case tableTdAverias[i].innerText = '37':
      tableTdAverias[i].innerText = '37 - Puerta del derecha'
      break;
    case tableTdAverias[i].innerText = '12':
      tableTdAverias[i].innerText = '12 - Kit herramientas'
      break;
    case tableTdAverias[i].innerText = '34':
      tableTdAverias[i].innerText = '34 - Puerta del izquierda'
      break;
    case tableTdAverias[i].innerText = '44':
      tableTdAverias[i].innerText = '44 - Puerta tras izquierda'
      break;
  }
}

graphStatLinkBtn.addEventListener('click', async (event) => {
  event.preventDefault()
  const dataAverias = []
  const dataCantidades = []
  for (const xLabels of tableTdAverias) {
    dataAverias.push(xLabels.innerText)
  }
  for (const yLabels of tableTdCantidades) {
    dataCantidades.push(yLabels.innerText)
  }
  const data = [dataAverias, dataCantidades]
  generateChart(data)
})


const generateChart = (data)=> {

// Función para generar color random
function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Crear el gráfico inicial
  const ctx = document.getElementById('pieChart').getContext('2d');

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data[0],
      datasets: [{
        data: data[1],
        backgroundColor: data[0].map(() => randomColor()),
        borderWidth: 1
      }]
    }
  });
}

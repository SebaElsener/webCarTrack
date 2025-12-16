
const obtenerDatos = async () => {
  const areas = await fetch('/utils/areas.json').then(r => r.json())
  const averias = await fetch('/utils/averias.json').then(r => r.json())
  const AREAS = areas.map(p => [p.id, p.descripcion])
  const AVERIAS = averias.map(p => [p.id, p.descripcion])
  return AREAS.concat(AVERIAS)
}

const tableTdAverias = document.getElementsByClassName('tableTdAverias')
const tableTdCantidades = document.getElementsByClassName('tableTdCantidades')
const graphStat = document.getElementById('graphStat')
const graphStatLinkBtn = document.getElementById('graphStatLinkBtn')
const graphStatImg = document.getElementById('graphStatImg')

const renameAreas = async () => {
  const listado = await obtenerDatos()
  for (let i = 0; i < tableTdAverias.length; i++) {
  const item = listado.find(e => e[0] === tableTdAverias[i].innerText)
  tableTdAverias[i].innerText = item[1]
}
}

renameAreas()

graphStatLinkBtn.addEventListener('click', async (event) => {
  event.preventDefault()
  const dataAverias = []
  const dataCantidades = []
  for (let i = 0; i < 10; i++) {
    dataAverias.push(tableTdAverias[i].innerText)
  }
  for (let i = 0; i < 10; i++) {
    dataCantidades.push(tableTdCantidades[i].innerText)
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
  const ctx = document.getElementById('barChart').getContext('2d');

  pieChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data[0],
      datasets: [{
        label: 'Top ten faltantes por piezas',
        data: data[1],
        backgroundColor: data[0].map(() => randomColor()),
        borderWidth: 1
      }]
    }
  });
}

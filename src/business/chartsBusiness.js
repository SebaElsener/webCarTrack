

import { ArcElement, BarController, BarElement, CategoryScale, Chart, LinearScale, PieController } from 'chart.js';
import {Canvas} from 'skia-canvas';
import fsp from 'node:fs/promises';

const getSampleChartInfo = async (xLabels, yLabels) => {

Chart.register([
PieController,
ArcElement
]);

const canvas = new Canvas(400, 300);
const chart = new Chart(
  canvas, // TypeScript needs "as any" here
  {
    type: 'pie',
    data: {
      labels: xLabels,
      datasets: [{
        label: '# of Votes',
        data: yLabels,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
      }]
    }
  }
);
const pngBuffer = await canvas.toBuffer('png', {matte: 'white'});
await fsp.writeFile('./public/charts/output.png', pngBuffer);
chart.destroy();
}

export {
    getSampleChartInfo
}
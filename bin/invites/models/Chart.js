"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderChart = void 0;
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const chartjs_plugin_datalabels_1 = __importDefault(require("chartjs-plugin-datalabels"));
const bigCanvasRenderService = new chartjs_node_canvas_1.CanvasRenderService(1000, 400, (chartJS) => {
    chartJS.pluginService.register(chartjs_plugin_datalabels_1.default);
    chartJS.plugins.register({
        beforeDraw: function (chartInstance) {
            const localCtx = chartInstance.chart.ctx;
            localCtx.fillStyle = 'white';
            localCtx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
        }
    });
});
const options = {
    maintainAspectRatio: false,
    animation: {
        duration: 0
    },
    legend: {
        display: false
    },
    scales: {
        yAxes: [
            {
                ticks: {
                    display: true,
                    fontColor: 'black',
                    fontStyle: 'bold',
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    padding: 20
                },
                gridLines: {
                    drawTicks: true,
                    display: true
                }
            }
        ],
        xAxes: [
            {
                gridLines: {
                    drawTicks: true,
                    display: true
                },
                ticks: {
                    display: true,
                    padding: 20,
                    fontColor: 'black',
                    fontStyle: 'bold'
                }
            }
        ]
    },
    plugins: {
        datalabels: {
            display: function (context) {
                // Always show first and last value
                if (context.dataIndex === 0 || context.dataIndex === context.dataset.data.length - 1) {
                    return true;
                }
                // Show value if either previous or next value is
                // different and if the value is not zero
                return (context.dataset.data[context.dataIndex] !== 0 &&
                    (context.dataset.data[context.dataIndex] !== context.dataset.data[context.dataIndex - 1] ||
                        context.dataset.data[context.dataIndex] !== context.dataset.data[context.dataIndex + 1]));
            }
        }
    }
};
exports.renderChart = (type, data) => bigCanvasRenderService.renderToBuffer({ type, data, options });
//# sourceMappingURL=Chart.js.map
<script>
import { Line } from "vue-chartjs";
import format from "date-fns/format";

export default {
  extends: Line,
  props: {
    dates: {
      type: Array,
      required: true,
    },
    dataPositif: {
      type: Array,
      required: true,
    },
    dataOdp: {
      type: Array,
      required: true,
    },
    dataPdp: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: 2,
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              // autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              // eslint-disable-next-line
              userCallback: function(label, index, labels) {
                if (Math.floor(label) === label) {
                  return label;
                }
              },
            },
          },
        ],
      },
    },
  }),

  computed: {
    chartdata() {
      return {
        labels: this.dates.map((date) => format(date, "dd MMM")),
        datasets: [
          {
            label: "ODP",
            borderColor: "#dd79f8",
            backgroundColor: "#dd79f8",
            data: this.dataOdp,
            fill: false,
          },
          {
            label: "PDP",
            borderColor: "#ffaa00",
            backgroundColor: "#ffaa00",
            data: this.dataPdp,
            fill: false,
          },
          {
            label: "Positif",
            borderColor: "#f87979",
            backgroundColor: "#f87979",
            data: this.dataPositif,
            fill: false,
          },
        ],
      };
    },
  },

  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>

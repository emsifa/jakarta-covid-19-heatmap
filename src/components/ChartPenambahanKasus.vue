<script>
import { Bar } from "vue-chartjs";
import format from "date-fns/format";

export default {
  extends: Bar,
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
            backgroundColor: "#dd79f8",
            data: this.dataOdp,
          },
          {
            label: "PDP",
            backgroundColor: "#ffaa00",
            data: this.dataPdp,
          },
          {
            label: "Positif",
            backgroundColor: "#f87979",
            data: this.dataPositif,
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

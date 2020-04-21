<template>
  <div id="app">
    <div id="map"></div>
    <div class="top-bar">
      <h1 class="text-3xl text-white mb-3">{{ playDate }}</h1>
      <div class="flex justify-center">
        <div class="inline-flex">
          <button @click="heatType = 'PDP'" class="font-bold py-2 px-4 rounded-l" :class="{
            'bg-gray-300 hover:bg-gray-400 text-gray-800': heatType != 'PDP',
            'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'PDP',
          }">
            PDP
          </button>
          <button @click="heatType = 'POSITIF'" class="font-bold py-2 px-4" :class="{
            'bg-gray-300 hover:bg-gray-400 text-gray-800': heatType != 'POSITIF',
            'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'POSITIF',
          }">
            POSITIF
          </button>
          <button @click="heatType = 'ODP'" class="font-bold py-2 px-4 rounded-r" :class="{
            'bg-gray-300 hover:bg-gray-400 text-gray-800': heatType != 'ODP',
            'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'ODP',
          }">
            ODP
          </button>
        </div>
      </div>
    </div>
    <div class="bottom-bar">
      <div class="flex justify-center mb-3">
        <button v-if="!playing" @click="play" class="control-btn rounded-full text-center text-3xl" :class="{
          'bg-teal-500 hover:bg-teal-600 text-white': !isLast && !isFirst && playing,
          'bg-gray-600 hover:bg-gray-700 text-gray-300': !playing,
        }">
          <i class="icon-play"></i>
        </button>
        <button v-if="playing" @click="pause" class="control-btn rounded-full bg-teal-500 hover:bg-teal-600 text-white text-center text-3xl">
          <i class="icon-pause"></i>
        </button>
      </div>
      <div class="flex justify-center">
        <div class="inline-flex">
          <button
            :disabled="isFirst"
            @click="prev"
            class="bg-gray-300 hover:bg-gray-400 disabled:opacity-75 text-gray-800 font-bold py-2 px-4 rounded-l"
          >
            <i class="icon-chevron-left"></i>
          </button>
          <select
            v-model="playIndex"
            class="block text-center appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-state"
          >
            <option v-for="(date, i) in dateRange" :key="i" :value="i">
              {{ date | format("dd MMMM yyyy") }}
            </option>
          </select>
          <button
            :disabled="isLast"
            @click="next"
            class="bg-gray-300 hover:bg-gray-400 disabled:opacity-75 text-gray-800 font-bold py-2 px-4 rounded-r"
          >
            <i class="icon-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import kelurahan from "./data/kelurahan";
import Leaflet from "./leaflet";
import format from "date-fns/format";
import addDays from "date-fns/addDays";

export default {
  name: "App",
  data() {
    return {
      kelurahan,
      map: null,
      data: [],
      tileLayer: null,
      heatType: 'POSITIF',
      positiveHeatLayer: null,
      pdpHeatLayer: null,
      odpHeatLayer: null,
      playIndex: -1,
      playing: false,
      delayDuration: 500,
    };
  },
  filters: {
    format(value, fmt) {
      return format(new Date(value), fmt);
    },
  },
  computed: {
    highestPositive() {
      return this.data.reduce((highest, data) => {
        return data.positif > highest ? data.positif : highest;
      }, 0);
    },
    highestPdp() {
      return this.data.reduce((highest, data) => {
        return data.pdp > highest ? data.pdp : highest;
      }, 0);
    },
    highestOdp() {
      return this.data.reduce((highest, data) => {
        return data.odp > highest ? data.odp : highest;
      }, 0);
    },
    firstDate() {
      return this.data.reduce((min, data) => {
        const date = new Date(data.tanggal);
        return date.getTime() < min.getTime() ? date : min;
      }, new Date(2050, 0, 0));
    },
    lastDate() {
      return this.data.reduce((max, data) => {
        const date = new Date(data.tanggal);
        return date.getTime() > max.getTime() ? date : max;
      }, new Date(0, 0, 0));
    },
    dateRange() {
      if (!this.firstDate || !this.lastDate) {
        return [];
      }

      const dateRange = [];
      const date = new Date(this.firstDate);
      while (this.lastDate.getTime() >= date.getTime()) {
        dateRange.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }

      return dateRange;
    },
    playDate() {
      if (this.playIndex === -1) {
        return;
      }
      return format(this.dateRange[this.playIndex], "dd LLLL yyyy");
    },
    isLast() {
      return this.playIndex === this.dateRange.length - 1;
    },
    isFirst() {
      return this.playIndex === 0;
    },
  },
  watch: {
    playIndex(index) {
      if (index > -1) {
        this.showHeat(format(this.dateRange[index], "yyyy-MM-dd"));
      }
    },
  },
  async mounted() {
    this.initMap();
    await this.loadData();
    window.app = this;
  },
  methods: {
    initMap() {
      this.map = Leaflet.map("map", {
        minZoom: 10,
        zoomControl: false,
      }).setView([-6.229728, 106.8094337], 11);

      this.tileLayer = Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(this.map);

      // for (let k in this.kelurahan) {
      //   Leaflet.marker(this.kelurahan[k], {
      //     title: k
      //   }).addTo(this.map)
      // }
    },
    async loadData() {
      const response = await fetch("./data.json");
      this.data = await response.json();
      this.playIndex = 0;
    },
    getData(date) {
      const data = this.data
        .filter((data) => data.tanggal == date)
        .filter((data) => this.kelurahan[data.kelurahan]);

      const dateBefore = format(addDays(new Date(date), -1), "yyyy-MM-dd");
      return data.length ? data : this.getData(dateBefore);
    },
    showHeat(date) {
      const data = this.getData(date);

      // // ODP
      // const odpHeatData = data.map(data => [
      //   this.kelurahan[data.kelurahan][0], // lat
      //   this.kelurahan[data.kelurahan][1], // lng
      //   data.odp / this.highestOdp   // intensity
      // ])
      // if (this.odpHeatLayer) {
      //   this.odpHeatLayer.remove()
      // }
      // this.odpHeatLayer = Leaflet.heatLayer(odpHeatData, {
      //   radius: 45,
      //   gradient: {
      //     0.5: 'lightblue',
      //     1: 'blue'
      //   }
      // }).addTo(this.map)

      // // PDP
      // const pdpHeatData = data.map(data => [
      //   this.kelurahan[data.kelurahan][0], // lat
      //   this.kelurahan[data.kelurahan][1], // lng
      //   data.pdp / this.highestPdp   // intensity
      // ])
      // if (this.pdpHeatLayer) {
      //   this.pdpHeatLayer.remove()
      // }
      // this.pdpHeatLayer = Leaflet.heatLayer(pdpHeatData, {
      //   radius: 36,
      //   gradient: {
      //     0.5: 'yellow',
      //     1: 'orange'
      //   }
      // }).addTo(this.map)

      // POSITIVE
      const positiveHeatData = data.map((data) => [
        this.kelurahan[data.kelurahan][0], // lat
        this.kelurahan[data.kelurahan][1], // lng
        data.positif / this.highestPositive, // intensity
      ]);

      if (!this.positiveHeatLayer) {
        this.positiveHeatLayer = Leaflet.heatLayer(positiveHeatData, {
          radius: this.getRadius(),
          blur: this.getBlur(),
          gradient: {
            0.15: "blue",
            0.3: "darkblue",
            0.45: "lime",
            0.6: "yellow",
            0.75: "orange",
            1: "red",
          },
        }).addTo(this.map);

        this.map.on("zoom", () => {
          this.positiveHeatLayer.setOptions({
            radius: this.getRadius(),
            blur: this.getBlur(),
          });
        });
      } else {
        this.positiveHeatLayer.setLatLngs(positiveHeatData);
      }
    },
    getRadius() {
      const zoom = this.map.getZoom();
      return zoom < 11 ? 10 : ((zoom - 10) * 17) + 1;
    },
    getBlur() {
      const zoom = this.map.getZoom();
      return zoom < 11 ? 10 : ((zoom - 10) * 14) + 1;
    },
    async play() {
      if (this.playIndex == this.dateRange.length - 1) {
        this.playIndex = -1;
        await this.delay(100);
      }
      this.playing = true
      // eslint-disable-next-line
      for (let date of this.dateRange.slice(this.playIndex + 1)) {
        if (this.playing == false) {
          return
        }
        this.playIndex++;
        await this.delay(this.delayDuration);
      }

      this.playing = false
    },
    pause() {
      this.playing = false
    },
    next() {
      if (this.playIndex < this.dateRange.length - 1) {
        this.playIndex++;
      }
    },
    prev() {
      if (this.playIndex > 0) {
        this.playIndex--;
      }
    },
    delay(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
  },
};
</script>

<style>
body {
  margin: 0px;
  padding: 0px;
  font-family: Arial, Helvetica, "sans-serif";
}

#app,
#map {
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100vh;
  position: absolute;
  background-color: #efefef;
}

.top-bar {
  z-index: 9999;
  width: 100%;
  text-align: center;
  position: absolute;
  left: 0px;
  top: 30px;
  text-transform: uppercase;
}

.bottom-bar {
  position: absolute;
  z-index: 9999;
  bottom: 30px;
  width: 90%;
  left: 0px;
  right: 0px;
  margin: auto;
}

.control-btn {
  line-height: 60px;
  width: 60px;
  height: 60px;
}
</style>

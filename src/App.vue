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
      <h4>
        <span class="bg-text-blue">{{ totalActiveCases }}</span>
        /
        <span class="text-red-500">{{ totalAllCases }}</span>
      </h4>
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
      heatLayer: null,
      pdpHeatLayer: null,
      odpHeatLayer: null,
      playIndex: -1,
      playing: false,
      delayDuration: 500,
      dateRange: [],
      markers: [],
      hiddenIcon: Leaflet.icon({
        iconUrl: './hidden-marker.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      ripIcon: Leaflet.icon({
        iconUrl: './rip-marker.png',
        iconSize: [30, 29],
        iconAnchor: [15, 15]
      }),
      healthIcon: Leaflet.icon({
        iconUrl: './health-marker.png',
        iconSize: [30, 26],
        iconAnchor: [15, 13]
      })
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
        this.showAt(this.playIndex);
      }
    },
    heatType() {
      this.showAt(this.playIndex);
      if (this.heatLayer) {
        this.heatLayer.setOptions({
          gradient: this.getGradient(),
          minOpacity: this.getMinOpacity()
        })
      }
    }
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
    },
    async loadData() {
      const response = await fetch("./data.json");
      const data = await response.json();
      this.dateRange = this.getDateRange(data);
      this.data = this.resolveData(data, this.dateRange);
      this.playIndex = 0;
    },
    getDateRange(data) {
      const firstDate = data.reduce((min, data) => {
        const date = new Date(data.tanggal);
        return date.getTime() < min.getTime() ? date : min;
      }, new Date(2050, 0, 0));

      const lastDate = data.reduce((max, data) => {
        const date = new Date(data.tanggal);
        return date.getTime() > max.getTime() ? date : max;
      }, new Date(0, 0, 0));

      const dateRange = [];
      const date = new Date(firstDate);
      while (lastDate.getTime() >= date.getTime()) {
        dateRange.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }

      return dateRange;
    },
    resolveData(data, dateRange) {
      let resolvedData = [];

      const dataAt = date => {
        const tanggal = format(date, 'yyyy-MM-dd')
        const d = data.filter(x => x.tanggal == tanggal).filter(x => this.kelurahan[x.kelurahan]);
        return d.length ? d : dataAt(addDays(new Date(date), -1));
      };

      dateRange.forEach((date, i) => {
        const prevDate = addDays(new Date(date), -1);
        const currData = dataAt(new Date(date));
        const prevData = i === 0 ? currData : dataAt(prevDate);
        resolvedData = [...resolvedData, ...this.getUpdates(currData, prevData)];
      });

      return resolvedData;
    },
    getData(date) {
      const data = this.data
        .filter((data) => data.tanggal == date)
        .filter((data) => this.kelurahan[data.kelurahan]);

      const dateBefore = format(addDays(new Date(date), -1), "yyyy-MM-dd");
      return data.length ? data : this.getData(dateBefore);
    },
    getUpdates(data, prevData) {
      const resolve = (data) => data.reduce((result, d) => ({...result, [d.kelurahan]: d}), {})
      const keyedData = resolve(data)
      const prevKeyedData = resolve(prevData)

      const updates = []
      for (let kelurahan in keyedData) {
        const curr = keyedData[kelurahan]
        const prev = prevKeyedData[kelurahan] || curr
        updates.push({
          ...curr,
          updates: {
            positif: curr.positif - prev.positif,
            pdp: curr.pdp - prev.pdp,
            odp: curr.odp - prev.odp,
            sembuh: curr.sembuh - prev.sembuh,
            meninggal: curr.meninggal - prev.meninggal,
          }
        })
      }
      return updates
    },
    showAt(index) {
      const date = format(this.dateRange[index], "yyyy-MM-dd")
      const data = this.getData(date);
      this.showHeat(data)
      this.showMarkers(data)
    },
    showHeat(data) {
      const heatData = data.map((data) => [
        this.kelurahan[data.kelurahan][0], // lat
        this.kelurahan[data.kelurahan][1], // lng
        this.getIntensity(data), // intensity
      ]);

      if (!this.heatLayer) {
        this.heatLayer = Leaflet.heatLayer(heatData, {
          radius: this.getRadius(),
          blur: this.getBlur(),
          gradient: this.getGradient(),
        }).addTo(this.map);

        this.map.on("zoom", () => {
          this.heatLayer.setOptions({
            radius: this.getRadius(),
            blur: this.getBlur(),
          });
        });
      } else {
        this.heatLayer.setLatLngs(heatData);
      }
    },
    clearMarkers() {
      this.markers.forEach(marker => marker.remove())
      this.markers.splice(0)
    },
    showMarkers(data) {
      this.clearMarkers()


      for (let d of data) {
        const latlng = this.kelurahan[d.kelurahan]
        const title = d.kelurahan
        const marker = Leaflet.marker(latlng, { title, icon: this.getIcon(d) })
          .addTo(this.map)
          .bindPopup(this.getPopup(d))

        this.markers.push(marker)
      }
    },
    getIcon(d) {
      if (d.updates.meninggal > 0) {
        return this.ripIcon
      }

      if (d.updates.sembuh > 0) {
        return this.healthIcon
      }

      return this.hiddenIcon
    },
    getPopup(data) {
      const n = x => x > 0 ? `+${x}` : x
      return [
        data.kelurahan,
        `Positif: ${data.positif} ${data.updates.positif !== 0 ? '('+n(data.updates.positif)+')' : ''}`,
        `Sembuh: ${data.sembuh} ${data.updates.sembuh !== 0 ? '('+n(data.updates.sembuh)+')' : ''}`,
        `Meninggal: ${data.meninggal} ${data.updates.meninggal !== 0 ? '('+n(data.updates.meninggal)+')' : ''}`,
        `PDP: ${data.pdp} ${data.updates.pdp !== 0 ? '('+n(data.updates.pdp)+')' : ''}`,
        `ODP: ${data.odp} ${data.updates.odp !== 0 ? '('+n(data.updates.odp)+')' : ''}`,
      ].join('<br/>')
    },
    getIntensity(data) {
      switch (this.heatType) {
        case 'POSITIF': return (data.positif - (data.sembuh + data.meninggal)) / this.highestPositive
        case 'ODP': return (data.odp - data.odpsp) / this.highestOdp
        case 'PDP': return (data.pdp - data.pdpps) / this.highestPdp
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
    getGradient() {
      switch (this.heatType) {
        case 'POSITIF': return {
          0.15: "#00aad4",
          0.3: "#0076ba",
          0.45: "lime",
          0.6: "yellow",
          0.75: "orange",
          1: "red",
        }
        case 'PDP': return {
          0.3: "#666",
          0.6: "#aba",
          1: "#8fb",
        }
        case 'ODP': return {
          0.3: "#666",
          0.6: "#aab",
          1: "#8cf",
        }
      }
    },
    getMinOpacity() {
      switch (this.heatType) {
        case 'POSITIF': return 0.1
        case 'PDP': return 0.05
        case 'ODP': return 0.05
      }
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
  height: 100%;
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

button:active, 
button:focus {
  outline: none;
}
</style>

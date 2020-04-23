<template>
  <div id="app">
    <div id="map"></div>
    <div class="top-bar" v-if="ready">
      <div class="flex justify-center">
        <div class="inline-flex">
          <button
            @click="heatType = 'PDP'"
            class="font-bold py-2 px-4 rounded-l"
            :class="{
              'bg-gray-300 hover:bg-gray-400 text-gray-800': heatType != 'PDP',
              'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'PDP',
            }"
          >
            PDP
          </button>
          <button
            @click="heatType = 'POSITIF'"
            class="font-bold py-2 px-4"
            :class="{
              'bg-gray-300 hover:bg-gray-400 text-gray-800':
                heatType != 'POSITIF',
              'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'POSITIF',
            }"
          >
            POSITIF
          </button>
          <button
            @click="heatType = 'ODP'"
            class="font-bold py-2 px-4 rounded-r"
            :class="{
              'bg-gray-300 hover:bg-gray-400 text-gray-800': heatType != 'ODP',
              'bg-teal-500 hover:bg-teal-699 text-white': heatType == 'ODP',
            }"
          >
            ODP
          </button>
        </div>
      </div>
      <h1 class="text-4xl text-white mt-3">{{ playDate }}</h1>
      <h4
        v-if="summary && !showDetailSummary"
        @click="showDetailSummary = true"
        class="mt-0 text-lg cursor-pointer"
      >
        <span
          v-if="heatType == 'POSITIF'"
          :class="{
            'text-red-500': summary.active > prevSummary.active,
            'text-green-500': summary.active < prevSummary.active,
            'text-gray-500': summary.active == prevSummary.active,
          }"
        >
          <i
            v-if="summary.active > prevSummary.active"
            class="icon-arrow-up"
          ></i>
          <i
            v-if="summary.active < prevSummary.active"
            class="icon-arrow-down"
          ></i>
          {{ summary.active }} kasus aktif
        </span>

        <span
          v-if="heatType == 'ODP'"
          :class="{
            'text-red-500': summary.odppp > prevSummary.odppp,
            'text-green-500': summary.odppp < prevSummary.odppp,
            'text-gray-500': summary.odppp == prevSummary.odppp,
          }"
        >
          <i v-if="summary.odppp > prevSummary.odppp" class="icon-arrow-up"></i>
          <i
            v-if="summary.odppp < prevSummary.odppp"
            class="icon-arrow-down"
          ></i>
          {{ summary.odppp }} DIPANTAU
        </span>

        <span
          v-if="heatType == 'PDP'"
          :class="{
            'text-red-500': summary.pdpmd > prevSummary.pdpmd,
            'text-green-500': summary.pdpmd < prevSummary.pdpmd,
            'text-gray-500': summary.pdpmd == prevSummary.pdpmd,
          }"
        >
          <i v-if="summary.pdpmd > prevSummary.pdpmd" class="icon-arrow-up"></i>
          <i
            v-if="summary.pdpmd < prevSummary.pdpmd"
            class="icon-arrow-down"
          ></i>
          {{ summary.pdpmd }} DIRAWAT
        </span>
      </h4>
      <h4
        v-if="summary && showDetailSummary && heatType == 'POSITIF'"
        @click="showDetailSummary = false"
        class="mt-0 cursor-pointer"
        style="font-size:.6rem"
      >
        <span
          :class="{
            'text-red-500': summary.positif > prevSummary.positif,
            'text-green-500': summary.positif < prevSummary.positif,
            'text-gray-500': summary.positif == prevSummary.positif,
          }"
        >
          <i
            v-if="summary.positif > prevSummary.positif"
            class="icon-arrow-up"
          ></i>
          <i
            v-if="summary.positif < prevSummary.positif"
            class="icon-arrow-down"
          ></i>
          {{ summary.positif }} total
        </span>
        <span class="text-gray-500 mx-2">/</span>
        <span
          :class="{
            'text-red-500': summary.meninggal > prevSummary.meninggal,
            'text-green-500': summary.meninggal < prevSummary.meninggal,
            'text-gray-500': summary.meninggal == prevSummary.meninggal,
          }"
        >
          <i
            v-if="summary.meninggal > prevSummary.meninggal"
            class="icon-arrow-up"
          ></i>
          <i
            v-if="summary.meninggal < prevSummary.meninggal"
            class="icon-arrow-down"
          ></i>
          {{ summary.meninggal }} meninggal
        </span>
        <span class="text-gray-500 mx-2">/</span>
        <span
          :class="{
            'text-green-500': summary.sembuh > prevSummary.sembuh,
            'text-red-500': summary.sembuh < prevSummary.sembuh,
            'text-gray-500': summary.sembuh == prevSummary.sembuh,
          }"
        >
          <i
            v-if="summary.sembuh > prevSummary.sembuh"
            class="icon-arrow-up"
          ></i>
          <i
            v-if="summary.sembuh < prevSummary.sembuh"
            class="icon-arrow-down"
          ></i>
          {{ summary.sembuh }} sembuh
        </span>
      </h4>

      <h4
        v-if="summary && showDetailSummary && heatType == 'PDP'"
        @click="showDetailSummary = false"
        class="mt-0 cursor-pointer"
        style="font-size:.6rem"
      >
        <span
          :class="{
            'text-red-500': summary.pdp > prevSummary.pdp,
            'text-green-500': summary.pdp < prevSummary.pdp,
            'text-gray-500': summary.pdp == prevSummary.pdp,
          }"
        >
          <i v-if="summary.pdp > prevSummary.pdp" class="icon-arrow-up"></i>
          <i v-if="summary.pdp < prevSummary.pdp" class="icon-arrow-down"></i>
          {{ summary.pdp }} total
        </span>
        <span class="text-gray-500 mx-2">/</span>
        <span
          :class="{
            'text-green-500': summary.pdpps > prevSummary.pdpps,
            'text-red-500': summary.pdpps < prevSummary.pdpps,
            'text-gray-500': summary.pdpps == prevSummary.pdpps,
          }"
        >
          <i v-if="summary.pdpps > prevSummary.pdpps" class="icon-arrow-up"></i>
          <i
            v-if="summary.pdpps < prevSummary.pdpps"
            class="icon-arrow-down"
          ></i>
          {{ summary.pdpps }} sehat
        </span>
      </h4>

      <h4
        v-if="summary && showDetailSummary && heatType == 'ODP'"
        @click="showDetailSummary = false"
        class="mt-0 cursor-pointer"
        style="font-size:.6rem"
      >
        <span
          :class="{
            'text-red-500': summary.odp > prevSummary.odp,
            'text-green-500': summary.odp < prevSummary.odp,
            'text-gray-500': summary.odp == prevSummary.odp,
          }"
        >
          <i v-if="summary.odp > prevSummary.odp" class="icon-arrow-up"></i>
          <i v-if="summary.odp < prevSummary.odp" class="icon-arrow-down"></i>
          {{ summary.odp }} total
        </span>
        <span class="text-gray-500 mx-2">/</span>
        <span
          :class="{
            'text-green-500': summary.odpsp > prevSummary.odpsp,
            'text-red-500': summary.odpsp < prevSummary.odpsp,
            'text-gray-500': summary.odpsp == prevSummary.odpsp,
          }"
        >
          <i v-if="summary.odpsp > prevSummary.odpsp" class="icon-arrow-up"></i>
          <i
            v-if="summary.odpsp < prevSummary.odpsp"
            class="icon-arrow-down"
          ></i>
          {{ summary.odpsp }} selesai
        </span>
      </h4>
    </div>
    <div class="bottom-bar" v-if="ready">
      <div class="flex justify-center mb-3">
        <button
          v-if="!playing"
          @click="play"
          class="control-btn rounded-full text-center text-3xl"
          :class="{
            'bg-teal-500 hover:bg-teal-600 text-white':
              !isLast && !isFirst && playing,
            'bg-gray-600 hover:bg-gray-700 text-gray-300': !playing,
          }"
        >
          <i class="icon-play"></i>
        </button>
        <button
          v-if="playing"
          @click="pause"
          class="control-btn rounded-full bg-teal-500 hover:bg-teal-600 text-white text-center text-3xl"
        >
          <i class="icon-pause"></i>
        </button>
      </div>
      <div class="flex justify-center">
        <div class="inline-flex">
          <button
            :disabled="isFirst || playing"
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
            :disabled="isLast || playing"
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
import id from "date-fns/locale/id";

export default {
  name: "App",
  data() {
    return {
      kelurahan,
      map: null,
      ready: false,
      data: [],
      tileLayer: null,
      heatType: "POSITIF",
      heatLayer: null,
      pdpHeatLayer: null,
      odpHeatLayer: null,
      playIndex: -1,
      playing: false,
      showDetailSummary: false,
      delayDuration: 750,
      dateRange: [],
      markers: [],
      summaries: {},
      hiddenIcon: Leaflet.icon({
        iconUrl: "./hidden-marker.png",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
      ripIcon: Leaflet.icon({
        iconUrl: "./rip-marker.png",
        iconSize: [30, 29],
        iconAnchor: [15, 15],
      }),
      healthIcon: Leaflet.icon({
        iconUrl: "./health-marker.png",
        iconSize: [30, 26],
        iconAnchor: [15, 13],
      }),
    };
  },
  filters: {
    format(value, fmt) {
      return format(new Date(value), fmt, { locale: id }).toUpperCase();
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
      return format(this.dateRange[this.playIndex], "dd LLLL yyyy", {
        locale: id,
      });
    },
    isLast() {
      return this.playIndex === this.dateRange.length - 1;
    },
    isFirst() {
      return this.playIndex === 0;
    },
    prevSummary() {
      if (this.playIndex < 0) {
        return null;
      }
      if (this.playIndex === 0) {
        return this.summary;
      }
      const date = format(this.dateRange[this.playIndex - 1], "yyyy-MM-dd");
      return this.summaries[date];
    },
    summary() {
      if (this.playIndex < 0) {
        return null;
      }

      const date = format(this.dateRange[this.playIndex], "yyyy-MM-dd");
      return this.summaries[date];
    },
  },
  watch: {
    playIndex(index) {
      if (index > -1 && !this.playing) {
        this.showAt(this.playIndex);
      }
    },
    heatType() {
      this.showAt(this.playIndex);
      if (this.heatLayer) {
        this.heatLayer.setOptions({
          gradient: this.getGradient(),
          minOpacity: this.getMinOpacity(),
        });
      }
    },
  },
  async mounted() {
    await this.initMap();
    await this.loadData();
    this.ready = true;
  },
  methods: {
    initMap() {
      return new Promise((resolve) => {
        this.map = Leaflet.map("map", {
          minZoom: 10,
          zoomControl: false,
        })
          .on("load", () => resolve())
          .setView([-6.229728, 106.8094337], 11);

        this.tileLayer = Leaflet.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(this.map);
      });
    },
    async loadData() {
      const response = await fetch("./data.json");
      const data = await response.json();
      this.dateRange = this.getDateRange(data);
      this.data = this.resolveData(data, this.dateRange);
      this.summaries = this.getSummaries(data, this.dateRange);
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
    getSummaries(data, dateRange) {
      const dataAt = (date) => {
        const tanggal = format(date, "yyyy-MM-dd");
        const d = data
          .filter((x) => x.tanggal == tanggal)
          .filter((x) => this.kelurahan[x.kelurahan]);
        return d.length ? d : dataAt(addDays(new Date(date), -1));
      };

      const summaries = {};
      dateRange.forEach((date) => {
        const summary = {
          odp: 0,
          odpsp: 0,
          odppp: 0,
          pdp: 0,
          pdpmd: 0,
          pdpps: 0,
          positif: 0,
          meninggal: 0,
          dirawat: 0,
          sembuh: 0,
          active: 0,
        };
        const data = dataAt(date);
        data.forEach((d) => {
          summary.odp += d.odp;
          summary.odppp += d.odpsp;
          summary.odpsp += d.odppp;
          summary.pdp += d.pdp;
          summary.pdpps += d.pdpps;
          summary.pdpmd += d.pdpmd;
          summary.positif += d.positif;
          summary.meninggal += d.meninggal;
          summary.sembuh += d.sembuh;
          summary.dirawat += d.dirawat;
          summary.active += d.positif - (d.meninggal + d.sembuh);
        });

        summaries[format(new Date(date), "yyyy-MM-dd")] = { ...summary };
      });

      return summaries;
    },
    resolveData(data, dateRange) {
      let resolvedData = [];

      const dataAt = (date) => {
        const tanggal = format(date, "yyyy-MM-dd");
        const d = data
          .filter((x) => x.tanggal == tanggal)
          .filter((x) => this.kelurahan[x.kelurahan]);
        return d.length ? d : dataAt(addDays(new Date(date), -1));
      };

      dateRange.forEach((date, i) => {
        const prevDate = addDays(new Date(date), -1);
        const currData = dataAt(new Date(date));
        const prevData = i === 0 ? currData : dataAt(prevDate);
        resolvedData = [
          ...resolvedData,
          ...this.getUpdates(currData, prevData),
        ];
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
      const resolve = (data) =>
        data.reduce((result, d) => ({ ...result, [d.kelurahan]: d }), {});
      const keyedData = resolve(data);
      const prevKeyedData = resolve(prevData);

      const updates = [];
      for (let kelurahan in keyedData) {
        const curr = keyedData[kelurahan];
        const prev = prevKeyedData[kelurahan] || curr;
        updates.push({
          ...curr,
          updates: {
            positif: curr.positif - prev.positif,
            pdp: curr.pdp - prev.pdp,
            odp: curr.odp - prev.odp,
            sembuh: curr.sembuh - prev.sembuh,
            meninggal: curr.meninggal - prev.meninggal,
          },
        });
      }
      return updates;
    },
    async showAt(index) {
      const date = format(this.dateRange[index], "yyyy-MM-dd");
      const data = this.getData(date);
      const promises = [
        this.showMarkers(data),
        this.showPoints(data),
      ];
      if (this.heatType == 'POSITIF') {
        promises.push(this.showDeathPoints(data));
        promises.push(this.showRecoverPoints(data));
      }
      await Promise.all(promises);
      this.showHeat(data);
    },
    async showHeat(data) {
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
      this.markers.forEach((marker) => marker.remove());
      this.markers.splice(0);
    },
    async showMarkers(data) {
      this.clearMarkers();

      for (let d of data) {
        const latlng = this.kelurahan[d.kelurahan];
        const title = d.kelurahan;
        const marker = Leaflet.marker(latlng, { title, icon: this.getIcon(d) })
          .addTo(this.map)
          .bindPopup(this.getPopup(d));

        this.markers.push(marker);
      }
    },
    async showPoints(data) {
      const points = data
        .map((d, i) => ({
          id: `pv${i}`,
          latlng: this.kelurahan[d.kelurahan],
          value: this.getPointValue(d),
        }))
        .filter((d) => d.value > 0);

      for (let d of points) {
        const size = 20 + d.value * 1.5;

        const bg =
          d.value > 10
            ? `rgba(150, 0, 100, .75)`
            : d.value > 5
            ? `rgba(255, 0, 200, .5)`
            : `rgba(255, 0, 200, .2)`;

        const styles = [
          `width: ${size}px`,
          `height: ${size}px`,
          `line-height: ${size}px`,
          `font-size: ${size * 0.5}px`,
          `background: ${bg}`,
        ];

        const icon = Leaflet.divIcon({
          className: "point-marker text-red-500",
          html: `<b id="${d.id}" style="${styles.join(";")}">${d.value}<b>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = Leaflet.marker(d.latlng, { icon }).addTo(this.map)

        setTimeout(() => {
          document.getElementById(d.id).classList.add("shown");
          setTimeout(() => marker.remove(), 500);
        }, 10);

        await this.delay(2);
      }
    },
    async showRecoverPoints(data) {
      const points = data
        .filter(d => d.updates.sembuh > 0)
        .map((d, i) => ({
          id: `pr${i}`,
          latlng: this.kelurahan[d.kelurahan],
          value: d.updates.sembuh,
        }));

      for (let d of points) {
        const size = 25 + d.value * 1.5;

        const styles = [
          `width: ${size}px`,
          `height: ${size}px`,
          `line-height: ${size}px`,
          `font-size: ${size * 0.5}px`,
          `background: rgba(0, 255, 0, .3)`,
        ];

        const icon = Leaflet.divIcon({
          className: "point-marker text-green-500",
          html: `<b id="${d.id}" style="${styles.join(";")}">${d.value}<b>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = Leaflet.marker(d.latlng, { icon }).addTo(this.map)

        setTimeout(() => {
          document.getElementById(d.id).classList.add("shown");
          setTimeout(() => marker.remove(), 500);
        }, 10);

        await this.delay(5);
      }
    },
    async showDeathPoints(data) {
      const points = data
        .filter(d => d.updates.meninggal > 0)
        .map((d, i) => ({
          id: `pr${i}`,
          latlng: this.kelurahan[d.kelurahan],
          value: d.updates.meninggal,
        }));

      for (let d of points) {
        const size = 30 + d.value * 1.5;

        const styles = [
          `width: ${size}px`,
          `height: ${size}px`,
          `line-height: ${size}px`,
          `font-size: ${size * 0.5}px`,
          `background: rgba(255, 0, 0, .7)`,
        ];

        const icon = Leaflet.divIcon({
          className: "point-marker text-red-500",
          html: `<b id="${d.id}" style="${styles.join(";")}">${d.value}<b>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = Leaflet.marker(d.latlng, { icon }).addTo(this.map)

        setTimeout(() => {
          document.getElementById(d.id).classList.add("shown");
          setTimeout(() => marker.remove(), 500);
        }, 10);

        await this.delay(5);
      }
    },
    getPointValue(d) {
      switch (this.heatType) {
        case "POSITIF":
          return d.updates.positif;
        case "ODP":
          return d.updates.odp;
        case "PDP":
          return d.updates.pdp;
      }
      return 0;
    },
    getIcon() {
      // if (d.updates.meninggal > 0) {
      //   return this.ripIcon;
      // }

      // if (d.updates.sembuh > 0) {
      //   return this.healthIcon;
      // }

      return this.hiddenIcon;
    },
    getPopup(data) {
      const n = (x) => (x > 0 ? `+${x}` : x);
      return [
        data.kelurahan,
        `Positif: ${data.positif} ${
          data.updates.positif !== 0 ? "(" + n(data.updates.positif) + ")" : ""
        }`,
        `Sembuh: ${data.sembuh} ${
          data.updates.sembuh !== 0 ? "(" + n(data.updates.sembuh) + ")" : ""
        }`,
        `Meninggal: ${data.meninggal} ${
          data.updates.meninggal !== 0
            ? "(" + n(data.updates.meninggal) + ")"
            : ""
        }`,
        `PDP: ${data.pdp} ${
          data.updates.pdp !== 0 ? "(" + n(data.updates.pdp) + ")" : ""
        }`,
        `ODP: ${data.odp} ${
          data.updates.odp !== 0 ? "(" + n(data.updates.odp) + ")" : ""
        }`,
      ].join("<br/>");
    },
    getIntensity(data) {
      switch (this.heatType) {
        case "POSITIF":
          return (
            (data.positif - (data.sembuh + data.meninggal)) /
            this.highestPositive
          );
        case "ODP":
          return (data.odp - data.odpsp) / this.highestOdp;
        case "PDP":
          return (data.pdp - data.pdpps) / this.highestPdp;
      }
    },
    getRadius() {
      const zoom = this.map.getZoom();
      return zoom < 11 ? 10 : (zoom - 10) * 17 + 1;
    },
    getBlur() {
      const zoom = this.map.getZoom();
      return zoom < 11 ? 10 : (zoom - 10) * 14 + 1;
    },
    getGradient() {
      switch (this.heatType) {
        case "POSITIF":
          return {
            0.15: "#00aad4",
            0.3: "#0076ba",
            0.45: "lime",
            0.6: "yellow",
            0.75: "orange",
            1: "red",
          };
        case "PDP":
          return {
            0.3: "#666",
            0.6: "#aba",
            1: "#8fb",
          };
        case "ODP":
          return {
            0.3: "#666",
            0.6: "#aab",
            1: "#8cf",
          };
      }
    },
    getMinOpacity() {
      switch (this.heatType) {
        case "POSITIF":
          return 0.1;
        case "PDP":
          return 0.05;
        case "ODP":
          return 0.05;
      }
    },
    async play() {
      if (this.playIndex == this.dateRange.length - 1) {
        this.playIndex = -1;
        await this.delay(100);
      }
      this.playing = true;
      // eslint-disable-next-line
      for (let date of this.dateRange.slice(this.playIndex + 1)) {
        if (this.playing == false) {
          return;
        }
        this.playIndex++;
        await this.showAt(this.playIndex);
      }

      this.playing = false;
    },
    pause() {
      this.playing = false;
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

.point-marker {
  z-index: 9999999999;
  text-align: center;
}

.point-marker b {
  display: block;
  transform: scale(0);
  opacity: 0;
  border-radius: 50%;
  transition: all 0.3s ease-out;
}

.point-marker b.shown {
  opacity: 1;
  transform: scale(1);
}
</style>

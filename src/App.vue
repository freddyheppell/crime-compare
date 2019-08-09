<template>
  <div id="app" class="h-full bg-police-blue font-sans">
    <div class="w-full">
      <div v-if="!displayStats" class="w-1/2 mx-auto">
        <h1 class="text-6xl text-white font-bold text-center">CrimeCompare</h1>
        <p class="text-white text-xl text-center font-bold my-10">Compare the number of crimes committed in the last sixth months between two postcodes in England, Wales and Northern Ireland.</p>
        <GetPostcodes :externalLoading="loading" v-on:postcodes-set="setPostcodes"/>

        <div class="text-center rounded bg-yellow-400 text-black text-sm font-bold px-4 py-3 mt-10" role="alert">
          <div class="text-center text-xl">
            <i class="fas fa-exclamation-triangle"></i> 
          </div>
          <p>Currently CrimeCompare doesn't take population into account. Areas with higher population will probably show as having higher rates of crime, even if the crimes per person is lower.</p>
        </div>
        <div class="text-center mt-3 text-white">
          <a href="https://github.com/freddyheppell/crime-compare"><i class="fab fa-github"></i></a>
        </div>
      </div>
    
      <div v-else class="text-white statistics-container">
        <PostcodeBar :area1="areas.area1" :area2="areas.area2" v-on:clear-postcodes="clearPostcodes"/>
        <Statistic v-for="(name, key, index) in crimeTypes" v-bind:key="key" :crime_key="key" :name="name" :area1="areas.area1.crime_stats[key]" :area2="areas.area2.crime_stats[key]" :delay_multiplier="index"/>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
import rateLimit from 'axios-rate-limit';
import GetPostcodes from './components/GetPostcodes';
import Statistic from './components/Statistic';
import PostcodeBar from './components/PostcodeBar';
import moment from 'moment';

var countBy = require('lodash/countBy');

export default {
  name: 'app',

  data: function() {
    return {
      http: null,
      datesToCheck: [],
      displayStats: false,
      loading: false,
      crimeTypes: {},
      areas: null
    }
  },
  
  components: {GetPostcodes, Statistic, PostcodeBar},

  mounted: function() {
    this.fetchLastUpdate();
    this.fetchCrimeTypes();
    this.http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 300 });
  },

  methods: {
    clearPostcodes: function() {
      this.areas = null;
      this.displayStats = false;
    },

    setPostcodes: function(data) {
      this.areas = data;
      console.log("set postcodes running");
      this.fetchCrimeData();
    },

    sumCrimeTypes: function(crimes) {
      console.log("summing crime types");
      return countBy(crimes, (crime) => {
        return crime.category;
      });
    },

    // generateCrimeTypeSet: function() {
    //   var area1CrimeTypeSet = new Set(Object.keys(this.areas.area1.crime_stats));
    //   var area2CrimeTypeSet = new Set(Object.keys(this.areas.area2.crime_stats));

    //   this.crimeTypeSet = new Set([...area1CrimeTypeSet, ...area2CrimeTypeSet]);
    // },

    fetchLastUpdate: function() {
      axios.get("https://data.police.uk/api/crime-last-updated")
        .then((response) => {
            var lastUpdateAt = moment(response.data.date);
            for (let i = 0; i < 6; i++) {
              this.datesToCheck.push(lastUpdateAt.format('YYYY-MM'));
              lastUpdateAt.subtract(1, 'month');
            }
        });
    },

    fetchCrimeTypes: function() {
      axios.get("https://data.police.uk/api/crime-categories")
        .then((response) => {
            const types = response.data;

            for (let i = 0; i < types.length; i++) {
              const type = types[i];
              this.crimeTypes[type.url] = type.name;
            }
        });
    },

    getRandomTimeout: function() {
      return Math.floor(Math.random() * (6000 - 1000 + 1) + 1000);
    },

    fetchCrimeForDate: function(lat, lng, date) {
      return this.http.get("https://data.police.uk/api/crimes-street/all-crime", {
        params: {
            lat: lat,
            lng: lng,
            date: date,
        }
      })
    },

    fetchCrimeData: function() {
      this.loading = true;
      var requests = [];

      this.areas.area1.crimes = [];
      this.areas.area2.crimes = [];

      console.log(this.datesToCheck.length);

      for (let j = 0; j < this.datesToCheck.length; j++) {
        const date = this.datesToCheck[j];

        console.log(date);

        console.log("pushing area 1 fetch for " + date);
        requests.push(
          this.fetchCrimeForDate(this.areas.area1.lat, this.areas.area1.lng, date).then(response => {
            console.log(response.data);
            this.areas.area1.crimes = this.areas.area1.crimes.concat(response.data);
          })
        );
    
        console.log("pushing area 2 fetch for " + date);
        requests.push(
          this.fetchCrimeForDate(this.areas.area2.lat, this.areas.area2.lng, date).then(response => {
            this.areas.area2.crimes = this.areas.area2.crimes.concat(response.data);
          })
        );
      }


      Promise.all(requests).then(() => {
        this.areas.area1.crime_stats = this.sumCrimeTypes(this.areas.area1.crimes);
        this.areas.area2.crime_stats = this.sumCrimeTypes(this.areas.area2.crimes);
        this.areas.area1.crime_stats["all-crime"] = this.areas.area1.crimes.length;
        this.areas.area2.crime_stats["all-crime"] = this.areas.area2.crimes.length;
        // this.generateCrimeTypeSet()
        console.log("setting loading to false");
        this.loading = false;
        this.displayStats = true;
      });
    }
  }
}
</script>

<style>
  .statistics-container {
    margin-top: 2rem;
  }
</style>

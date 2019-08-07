<template>
  <div id="app" class="h-full font-sans">
    <div class="w-screen">
      <div v-if="!displayStats" class="w-1/2 mx-auto">
        <h1 class="text-6xl text-white font-bold text-center">CrimeCompare</h1>
        <GetPostcodes :externalLoading="loading" v-on:postcodes-set="setPostcodes"/>
      </div>
      <div v-else class="text-white">
        <PostcodeBar :area1="areas.area1" :area2="areas.area2"/>
        <Statistic v-for="(name, key) in crimeTypes" v-bind:key="key" :name="name" :area1="areas.area1.crime_stats[key]" :area2="areas.area2.crime_stats[key]"/>
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
  },

  methods: {
    setPostcodes: function(data) {
      this.areas = data;
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

    fetchCrimeData: function() {
      this.loading = true;
      var requests = [];

      this.areas.area1.crimes = [];
      this.areas.area2.crimes = [];

      const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 300 });

      for (let j = 0; j < this.datesToCheck.length; j++) {
        const date = this.datesToCheck[j];

        
        requests.push(
          http.get("https://data.police.uk/api/crimes-street/all-crime", {
            params: {
                lat: this.areas.area1.lat,
                lng: this.areas.area1.lng,
                date: date,
            }
          }).then(response => {
            console.log(response.data);
            this.areas.area1.crimes = this.areas.area1.crimes.concat(response.data);
          })
        );
      
        requests.push(
          http.get("https://data.police.uk/api/crimes-street/all-crime", {
            params: {
              lat: this.areas.area2.lat,
              lng: this.areas.area2.lng,
              date: date,
            }
          }).then(response => {
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
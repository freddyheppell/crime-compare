<template>
    <div>
        <div class="flex mt-4">
          <div class="w-1/2 px-3">
            <h2 class="text-3xl text-white text-center">Enter a postcode</h2>
            <input type="text" v-model="area1.postcode" class="postcode-input" :class="'status-' + area1.status">
          </div>
          <div class="w-1/2 px-3">
            <h2 class="text-3xl text-white text-center">Enter a postcode</h2>
            <input type="text" v-model="area2.postcode" class="postcode-input" :class="'status-' + area2.status">
          </div>
        </div>
        <div class="mt-20 text-center">
            <button class="search-button" :disabled="isLoading" :class="buttonClass" @click="fetch">
                <span v-if="isLoading"><i class="fas fa-cog fa-spin"></i></span>
                <span class="normal-text" v-else><i class="fas fa-search"></i> Compare</span>
            </button>
        </div>
    </div>
</template>


<script>
const axios = require('axios');

export default {
    props: ["externalLoading"],

    data: function() {
        return {
            thisLoading: false,
            area1: {
                postcode: "",
                lat: "",
                lng: "",
                status: null
            },
            area2: {
                postcode: "",
                lat: "",
                lng: "",
                status: null
            }
        }
    },

    computed: {
        isLoading: function() {
            return this.externalLoading || this.thisLoading;
        },

        buttonClass: function() {
            if (this.isLoading) return "disabled";
            return "";
        }
    },

    methods: {
        fetchPostcodeData: function(postcode) {
            return axios.get("https://api.postcodes.io/postcodes/" + postcode)
                .then(response => {
                        return {
                        postcode: response.data.result.postcode,
                        lat: response.data.result.latitude,
                        lng: response.data.result.longitude,
                        status: "fetched"
                    }
            });
        },

        fetch: function() {
            this.thisLoading = true;

            var area1 = this.fetchPostcodeData(this.area1.postcode)
            var area2 = this.fetchPostcodeData(this.area2.postcode)

            area1.then(data => {
                    this.area1 = data;
                })
                .catch(error => {
                    this.area1.status = "error";
                });
            
            
            area2.then(data => {
                    this.area2 = data;
                })
                .catch(error => {
                    this.area2.status = "error";
                })

            Promise.all([area1, area2]).then(() => {
                this.$emit("postcodes-set", {
                    area1: this.area1,
                    area2: this.area2
                })
                this.thisLoading = false;
            });
        }
    }
}
</script>

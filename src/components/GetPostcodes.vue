<template>
    <form v-on:submit.prevent="fetch">
        <div>
            <div class="bg-red-600 text-white px-4 py-3 rounded relative" v-if="error.text" role="alert">
                <span class="block sm:inline">{{ error.text }} </span>
            </div>
        </div>
        <div class="flex mt-4">
          <div class="w-1/2 px-3">
            <h2 class="text-3xl text-white text-center">Enter a postcode</h2>
            <input type="text" v-model="area1.postcode" class="postcode-input" :class="(error.leftError) ? 'status-error' : '' ">
          </div>
          <div class="w-1/2 px-3">
            <h2 class="text-3xl text-white text-center">Enter a postcode</h2>
            <input type="text" v-model="area2.postcode" class="postcode-input" :class="(error.rightError) ? 'status-error' : '' ">
          </div>
        </div>
        <div class="mt-20 text-center">
            <button class="search-button" :disabled="isLoading" :class="buttonClass" type="submit">
                <span v-if="isLoading"><i class="fas fa-cog fa-spin"></i></span>
                <span class="normal-text" v-else><i class="fas fa-search"></i> Compare</span>
            </button>
        </div>
    </form>
</template>


<script>
const axios = require('axios');

export default {
    props: ["externalLoading"],

    data: function() {
        return {
            thisLoading: false,
            error: {
                text: null,
                leftError: false,
                rightError: false
            },
            area1: {
                postcode: "",
                lat: "",
                lng: "",
                country: "",
                status: null
            },
            area2: {
                postcode: "",
                lat: "",
                lng: "",
                country: "",
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
                        country: response.data.result.country,
                        status: "fetched"
                    }
            });
        },

        fetch: function() {
            this.thisLoading = true;
            this.error.leftError = false;
            this.error.rightError = false;
            this.error.text = null;

            var area1 = this.fetchPostcodeData(this.area1.postcode)
            var area2 = this.fetchPostcodeData(this.area2.postcode)

            area1.then(data => {
                    this.area1 = data;
                })
                .catch(error => {
                    this.error.text = "This postcode doesn't seem valid";
                    this.error.leftError = true;
                    this.thisLoading = false;
                });
            
            
            area2.then(data => {
                    this.area2 = data;
                })
                .catch(error => {
                    this.error.text = "This postcode doesn't seem valid";
                    this.error.rightError = true;
                    this.thisLoading = false;
                })

            Promise.all([area1, area2]).then(() => {
                if (this.area1.postcode === this.area2.postcode) {
                    this.error.text = "Both postcodes are the same";
                    this.error.leftError = true;
                    this.error.rightError = true;

                    this.thisLoading = false;
                    return;
                }

                this.$emit("postcodes-set", {
                    area1: this.area1,
                    area2: this.area2
                })
                this.thisLoading = false;
            });

            return false;
        }
    }
}
</script>

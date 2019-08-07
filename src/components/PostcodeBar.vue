<template>
    <div class="bg-gray-300 text-xl text-black top-0 fixed w-full z-50">
        <div v-if="warnAboutScotland" class="bg-red-600 text-center text-white font-bold">
            <i class="fas fa-exclamation-triangle"></i> Data from Scotland only includes British Transport Police data
        </div>
        <div class="flex justify-between px-10 font-bold">
            <div>{{ area1.postcode }}</div>
            <div>{{ area2.postcode }}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["area1", "area2"],

    computed: {
        warnAboutScotland: function() {
            return this.area1.country == "Scotland" || this.area2.country == "Scotland";
        }
    }
}
</script>

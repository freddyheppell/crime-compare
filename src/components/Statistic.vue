<template>
    <div v-if="show" style="height: 200px;">
        <div class="whitebg w-full"></div>
        <div class="blackbg" :style="'width:' + area1Percent + '%'"></div>
        <div class="makered w-full" ></div>

        <span class="crime-name pl-1 font-bold"><i class="fa-fw" :class="icon"></i> {{ name }}</span>
    </div>
</template>


<script>
export default {
    props: ["name", "area1", "area2", "crime_key"],

    data: function() {
        return {
            icons: {
                "vehicle-crime": "fas fa-car",
                "shoplifting": "fas fa-shopping-bag",
                "theft-from-the-person": "fas fa-wallet",
                "bicycle-theft": "fas fa-bicycle",
                "burglary": "fas fa-home-lg-alt",
                "criminal-damage-arson": "fas fa-dumpster-fire",
                "drugs": "fas fa-capsules",
                "possession-of-weapons": "fas fa-mace",
                "other-theft": "fas fa-sack-dollar",
                "violent-crime": "fas fa-boxing-glove",
                "anti-social-behaviour": "fas fa-comment-exclamation",
                "other-crime": "fas fa-balance-scale",
                "public-order": "fas fa-gavel",
                "robbery": "fas fa-knife-kitchen",
                "all-crime": "fas fa-bars fa-rotate-90"
            }
        }
    },

    computed: {
        sum: function() {
            return this.area1 + this.area2;
        },

        show: function() {
            return this.area1 != null && this.area2 != null;
        },

        area1Percent: function() {
            return (this.area1 / this.sum) * 100;
        },

        icon: function() {
            return this.icons[this.crime_key]
        }
    }
}
</script>

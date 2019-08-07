<template>
    <div v-if="show" style="height: 200px;">
        <div>
            <div class="whitebg w-full"></div>
            <div class="blackbg" :style="'width:' + area1Percent + '%'"></div>
            <div class="makered w-full" ></div>

            <span class="crime-name font-bold">{{ name }}</span>
        </div>
    </div>
</template>


<script>
export default {
    props: ["name", "area1", "area2"],

    computed: {
        sum: function() {
            return this.area1 + this.area2;
        },

        show: function() {
            return this.area1 != null && this.area2 != null;
        },

        area1Percent: function() {
            return (this.area1 / this.sum) * 100;
        }
    }
}
</script>

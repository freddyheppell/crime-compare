<template>
    <div>
        <div class="flex">
            <div :style="'width:' + area1Percent + '%'" class="bg-white py-40">
                <div class="text-5xl mx-2 text-black">{{ name }}</div>
            </div>
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

        area1Percent: function() {
            return (this.area1 / this.sum) * 100;
        }
    }
}
</script>

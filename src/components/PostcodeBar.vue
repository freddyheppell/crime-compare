<template>
    <div class="flex bg-gray-300 px-10 text-xl text-black justify-between font-bold top-0 sticky">
        <div>{{ area1.postcode }}</div>
        <div>{{ area2.postcode }}</div>
    </div>
</template>

<script>
export default {
    props: ["area1", "area2"]
}
</script>

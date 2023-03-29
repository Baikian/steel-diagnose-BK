<template>
  <el-card class="box-card">
    <template #header>
      <div style = "margin-right: 13px; margin-top: 7px;">
        <svg t="1673965441478" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="6169" width="20" height="20">
          <path
            d="M138.545152 765.825024l95.52896 0c16.662528 0 30.16704-13.50656 30.16704-30.164992L264.241152 309.9648c0-16.662528-13.50656-30.16704-30.16704-30.16704L138.545152 279.79776c-16.662528 0-30.16704 13.50656-30.16704 30.16704l0 425.693184C108.376064 752.318464 121.882624 765.825024 138.545152 765.825024zM445.435904 765.825024l95.52896 0c16.662528 0 30.16704-19.744768 30.16704-44.10368L571.131904 99.325952c0-24.36096-13.50656-44.107776-30.16704-44.107776l-95.52896 0c-16.66048 0-30.16704 19.746816-30.16704 44.107776l0 622.395392C415.268864 746.080256 428.773376 765.825024 445.435904 765.825024zM752.326656 765.825024l95.52896 0c16.662528 0 30.16704-18.345984 30.16704-40.986624l0-578.3552c0-22.636544-13.50656-40.984576-30.16704-40.984576l-95.52896 0c-16.662528 0-30.16704 18.348032-30.16704 40.984576l0 578.3552C722.157568 747.476992 735.664128 765.825024 752.326656 765.825024zM6.144 816.103424l968.704 0 0 50.2784-968.704 0 0-50.2784Z"
            fill="#2c2c2c" p-id="6170"></path>
        </svg>
      </div>
      <div class="card-header">
        <span>Monitor View</span>
      </div>
    </template>
    <!-- <WhatIfMain
      class="what-if-view"
      :plateStati="plateStati"
      :gantData="gantData"
    /> -->
    <div id="WhatIfMain"></div>
  </el-card>
</template>

<script setup>
import { onMounted, computed, ref, reactive, toRaw, watch } from "vue-demi";
import { useStore } from "vuex";

import { HEIGHT } from './size';
import { getPlatesStatistics, getGantData, getGanttDataFromNode } from '@/api/monitor';
import { WhatIfView, TREND, GANTT, TEMPORAL } from './main';

// 离线数据
import platesStatistics from '@/data/platesStatistics.json';
import ganttData from '@/data/ganttData.json';
import batchData from '@/data/batchData.json'

const store = useStore();
const monthPickDate = computed(() => store.state.monthPickDate);
const brushDate = computed(() => store.state.brushDate);

let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('WhatIfMain');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new WhatIfView({ width: viewWidth, height: viewHeight }, ele);
})


/*******************************
 * 
 *        获取数据并绘图
 * 
 * *****************************
 */

// 趋势概览视图
let plateStati = ref(0);
// watch(monthPickDate, () => {
// 获取生产趋势统计数据
// getPlatesStatistics(5, monthPickDate.value[0], monthPickDate.value[1])
//   .then(res => {
//     plateStati.value = res.data;
//     console.log('trend数据',plateStati.value);
//   });
setTimeout(() => {
  plateStati.value = platesStatistics;
}, 10);
watch(plateStati, () => {
  renderInstance.render(TREND, toRaw(plateStati.value));
});

// 甘特视图
let gantData = ref(0);
// watch(brushDate, () => {
//   // 获取甘特图数据
//   function convert(date){
//     let newDate = [];
//     newDate[0] = Number(date[2]);
//     newDate[1] = Number(date[3]);
//     newDate[2] = Number(date[6]);
//     newDate[3] = Number(date[8]);
//     newDate[4] = Number(date[9]);
//     newDate[5] = Number(date[11]);
//     newDate[6] = Number(date[12]);
//     return newDate.join("");
//   }
//   let startDate = convert(brushDate.value[0]);
//   let endDate = convert(brushDate.value[1]);

//   console.log(startDate);
//   console.log(endDate);
//   getGanttDataFromNode(startDate, endDate)
//     .then(res => gantData.value = res.data);
// })
setTimeout(() => {
  // console.log("我运行了吗?");
  gantData.value = ganttData;
}, 10);
watch(gantData, () => {
  renderInstance.render(GANTT, toRaw(gantData.value));
});

// 诊断视图
let time = ref(0);
setTimeout(() => {
  time.value = 1
})
watch(time, () => {
  // console.log('batch update', batchData)
  // renderInstance.render(TEMPORAL, batchData);
});

</script>

<style>
@import url('@/assets/style/MyCard.scss');

#WhatIfMain {
  height: 1010px;
}
</style>
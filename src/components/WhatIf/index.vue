<template>
  <el-card class="box-card">
    <template #header>
      <div class="title-background">
      <div class="title-text">
        <span>Monitor View</span>
      </div>
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
import testData from '@/data/testData.json'

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
  renderInstance.render(TEMPORAL, testData);
});

</script>

<style>
@import url('@/assets/style/MyCard.scss');

#WhatIfMain {
  height: 1010px;
}
.title-background {
  border-top: 40px solid #455964;
  border-left: 0px solid transparent;
  border-right: 40px solid transparent;
  height: 0;
  width: 160px;
}

.title-text {
  padding-left: 5px;
  color: white;
  font-size: 19px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bolder;
  justify-content: center;
  align-content: center;
}
</style>
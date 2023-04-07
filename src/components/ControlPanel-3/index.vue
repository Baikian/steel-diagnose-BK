<template>
  <el-card class="box-card parallel-card">
    <template #header>
      <div class="title-background">
        <div class="title-text">
          <span>Parallel</span>
        </div>
      </div>
    </template>
    <div id="ParallelMain"></div>
  </el-card>
</template>
<script setup>
import  Paralllel  from "./paralllel.vue";
import { onMounted, ref, watch, toRaw, computed, reactive, watchEffect } from "vue-demi";
import { useStore } from "vuex";
import { baogangAxios,baogangPlotAxios } from "../../api/axio";
import {getPlatesStatistics,getGantData,getGanttDataFromNode,} from "@/api/monitor";
import {parallelCoordinates} from './main'
import * as d3 from 'd3';
import test from './axio.json';
import mid from './mid.json';
import newtest from './newtest.json';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('ParallelMain');
  const viewWidth = ele.offsetWidth-6;
  const viewHeight = ele.offsetHeight;
  renderInstance = new parallelCoordinates({ width: viewWidth, height: 600 }, ele);
  renderInstance.render(test,mid,newtest);
})
// let plateStati = ref(0);
// const store = useStore();
// const monthPickDate = computed(() => store.state.monthPickDate);
// watch(monthPickDate, () => {
//   // 获取生产趋势统计数据
//   // console.log('monthPickDate',monthPickDate)
//   getPlatesStatistics(5, monthPickDate.value[0], monthPickDate.value[1]).then(
//     (res) => (plateStati.value = res.data),
//     d3.select("#brushableParallel").selectChildren('*').remove(),
//     getTimeBrushData()
//   );
// });
// let newData = reactive(null)
// let timeBrushData =ref(null)
// 0: '2021-06-01 00:00:00', 1: '2021-06-30 00:00:00'
// async function getTimeBrushData() {
// let date = new Date(monthPickDate.value[1]);
// let data1=monthPickDate.value[0].slice(2,4)+parseInt(monthPickDate.value[0].slice(5,7)).toString(16).toUpperCase()+monthPickDate.value[0].slice(8,10)+'00'
// let data2=monthPickDate.value[1].slice(2,4)+parseInt(monthPickDate.value[1].slice(5,7)).toString(16).toUpperCase()+monthPickDate.value[1].slice(8,10)+'00'
// console.log('data1',monthPickDate)
// console.log('data2',data2)
// date = date.getFullYear() + '-' + (date.getMonth()+1) + '-'+( date.getDate()-27 )+ ' '+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

// }

</script>

<style>
.parallel-card {
  border-bottom: 0px;
}

#ParallelMain {
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 10px;
  height: 355px;
  width: 290px;
  overflow-y: auto;
}
</style>
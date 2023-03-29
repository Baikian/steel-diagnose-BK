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
import Paralllel from "./paralllel.vue";
import { onMounted, ref, watch, toRaw, computed, reactive, watchEffect } from "vue-demi";
import { useStore } from "vuex";
import { baogangAxios, baogangPlotAxios } from "../../api/axio";
import { getPlatesStatistics, getGantData, getGanttDataFromNode, } from "@/api/monitor";
import { parallelCoordinates } from './main'
import test from './axio.json'
import mid from "./mid.json";
import * as d3 from 'd3';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('ParallelMain');
  const viewWidth = ele.offsetWidth - 6;
  const viewHeight = ele.offsetHeight;
  renderInstance = new parallelCoordinates({ width: viewWidth, height: 600 }, ele);
  renderInstance.render(test, mid);
})


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
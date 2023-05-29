<template>
  <el-card class="box-card controlpanel-card">
    <template #header>
      <div class="title-background">
        <div class="title-text">
          <span>Category View</span>
        </div>
      </div>
    </template>
    <div class="ControlPanelMain">
      <el-row>
        <el-col :span="6" id='timepicker'>
          <span>Time Picker:</span>
        </el-col>
        <el-col :span="18">
          <div class="block">
            <el-date-picker v-model="value1" type="daterange" start-placeholder="Begin" end-placeholder="End"
              :default-value="[new Date(2020, 4, 1), new Date(2020, 5, 1)]" />
          </div>
        </el-col>
      </el-row>
    </div>
    <div id="ParallelMain"></div>
  </el-card>
</template>


<script setup>
import { onMounted, ref, watch, toRaw, computed, reactive, watchEffect } from "vue-demi";
import { useStore } from "vuex";
import { baogangAxios, baogangPlotAxios } from "../../api/axio";
import { getPlatesStatistics, getGantData, getGanttDataFromNode, } from "@/api/monitor";
import { parallelCoordinates } from './main'
import * as d3 from 'd3';
import test from './axio.json';
import mid from './mid.json';
import newtest from './newtest.json';
import { Calendar, Search } from '@element-plus/icons-vue'

const value1 = ref('')
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('ParallelMain');
  const viewWidth = ele.offsetWidth - 6;
  const viewHeight = ele.offsetHeight;
  renderInstance = new parallelCoordinates({ width: viewWidth, height: 600 }, ele);
  renderInstance.render(test, mid, newtest);
})

</script>

<style scoped>
@import url('@/assets/style/MyCard.scss');

.parallel-card {
  margin-left: 0px;
  border-top: 0px;
  background-color: white;
}

#ParallelMain {
  margin-bottom: 10px;
  height: 470px;
  overflow-y: auto;
}

.controlpanel-card {
  background-color: white;
  margin-top: 10px;
  margin-left: 0px;
  border-bottom: 0px;
}

.ControlPanelMain {
  display: flex;
  flex-direction: column;
  justify-content: center;
  top: 40px;
  height: 50px;
}

/* 时间设置 */
.block {
  width: 100%;
  display: flex;
  align-items: center;
  /* 设置Flex子元素在垂直方向上居中 */
}

.block>>>.el-input__inner {
  height: 35px;
  width: 94%;
}

#timepicker {
  font-family: 'Lato', sans-serif;
  font-weight: 100;
  font-size: 15px;
  display: flex;
  align-items: center;
}

#timepicker>>>span {
  align-self: center;
}
</style>
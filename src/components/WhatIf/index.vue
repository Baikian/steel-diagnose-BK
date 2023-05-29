<template>
  <el-card class="box-card whatif-card">
    <template #header>
      <div class="title-background222">
        <div class="title-text">
          <span>Monitoring & Diagnosis View</span>
        </div>
      </div>

      <div class="ILUS-box">
        <el-row class="ILUS-content">
          <el-col class="ILUS-col-content" :span="8">
            <div class="top-box">
              <div id="good-top">
              </div>
              <span class="ILUS-text">good</span>
            </div>
            <div class="bottom-box">
              <div id="good-bottom">
              </div>
              <span class="ILUS-text"> good</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="top-box">
              <div id="good-top">
              </div>
              <span class="ILUS-text">bad</span>
            </div>
            <div class="bottom-box">
              <div id="good-bottom">
              </div>
              <span class="ILUS-text"> good</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="top-box">
              <div id="good-top">
              </div>
              <span class="ILUS-text">no</span>
            </div>
            <div class="bottom-box">
              <div id="good-bottom">
              </div>
              <span class="ILUS-text"> good</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="button-group-2">
        <el-radio-group class='switch-2' v-model="radio" fill="#455964">
          <el-radio-button label="离" />
          <el-radio-button label="连" />
        </el-radio-group>
        <el-button class='diagbutton'>
          <img class="diagicon" src="./diag.svg">
        </el-button>

        <el-dropdown :hide-on-click="false">
          <el-button>
            Control Pannel
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <span class="ILUS-text">begin_time:</span>
                  <el-slider v-model="value2" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <span class="ILUS-text">count_num:</span>
                  <el-slider v-model="value3" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <span class="ILUS-text">ultralim_val:</span>
                  <el-slider v-model="value4" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <span class="ILUS-text">msa_count:</span>
                  <el-slider v-model="value5" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <span class="ILUS-text">stage_param:</span>
                  <el-slider v-model="value6" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class='sliderbox'>
                  <el-button>
                    <span class="ILUS-text">Horizon</span>
                  </el-button>
                  <el-button>
                    <span class="ILUS-text">River</span>
                  </el-button>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <div>
      <div id="WhatIfMain"></div>
      <div id="balabalaMain"></div>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, computed, ref, reactive, toRaw, watch } from "vue-demi";
import { useStore } from "vuex";
import { HEIGHT } from './size';
import { getPlatesStatistics, getGantData, getGanttDataFromNode } from '@/api/monitor';
import { WhatIfView, bilibiliView, TREND, GANTT, TEMPORAL } from './main';
// 离线数据
import platesStatistics from '@/data/platesStatistics.json';
import ganttData from '@/data/ganttData-2.json';
import batchData from '@/data/batchData.json'
import testData from '@/data/testData2.json'
import { Delete, Edit, Search, Share, Upload, ArrowDown } from '@element-plus/icons-vue'

const radio = ref('离')
const value = ref('Option1')
const options = [
  {
    value: 'Option1',
    label: 'T-SNE',
  },
  {
    value: 'Option2',
    label: 'PCA',
  },
  {
    value: 'Option3',
    label: 'MDS',
  }
]
const value2 = ref(0)
const value3 = ref(0)
const value4 = ref(0)
const value5 = ref(0)
const value6 = ref(0)


const store = useStore();
const monthPickDate = computed(() => store.state.monthPickDate);
const brushDate = computed(() => store.state.brushDate);
let renderInstance = null;
let renderInstance2 = null;
onMounted(() => {
  const ele = document.getElementById('WhatIfMain');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new WhatIfView({ width: viewWidth, height: viewHeight }, ele);

  const ele2 = document.getElementById('balabalaMain');
  const viewWidth2 = ele2.offsetWidth;
  const viewHeight2 = ele2.offsetHeight;
  renderInstance2 = new bilibiliView({ width: viewWidth2, height: viewHeight2 }, ele2);
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
  renderInstance2.render(TEMPORAL, testData);
});

</script>

<style>
@import url('@/assets/style/MyCard.scss');
@import url('https://fonts.googlefonts.cn/css?family=Lato:600');

.whatif-card {
  margin-left: 0px;
  margin-top: 10px;
  border-left: 0px;
}

.title-background222 {
  position: relative;
  display: inline-block;
  border-top: 35px solid #455964;
  border-left: 0px solid transparent;
  border-right: 35px solid transparent;
  height: 0;
  width: 40%;
}

#WhatIfMain {
  height: 320px;
}

#balabalaMain {
  width: 1200px;
  height: 613px;
  margin-left: 0px;
}

.ILUS-box {
  width: 30%;
  height: 35px;
}

.ILUS-content {
  height: 100%;
}

.ILUS-col-content {
  height: 100%;
}

.ILUS-text {
  font-family: 'Lato', sans-serif;
  font-size: 14px;
}

.top-box {
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
  height: 50%;
}

.bottom-box {
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
  height: 50%;
}

#good-top {
  margin-right: 5%;
  width: 20%;
  height: 50%;
  background-color: #455964;
}

#good-bottom {
  margin-right: 5%;
  width: 20%;
  height: 50%;
  background-color: #455964;
}

.button-group-2 {
  display: flex;
  align-items: center;
  width: 30%;
  height: 35px;
}

.switch-2 .el-radio-button__inner {
  width: 45px;
  height: 30px;
  font-size: 8px;
  text-align: center;
  /* 修改字体大小 */
  color: #455964;
}

.select {
  margin-left: 10px;
}

.select .el-input .el-input__inner {
  height: 30px;
  width: 70px;
  font-size: 10px;
  border-color: #455964 !important;
  padding-left: 10%;
  padding-right: 25%;
  text-align: center;
}

.select .el-input.is-focus .el-input__inner {
  border-color: #455964 !important;
}

.select .el-input .el-input__suffix {
  right: 5px;
}

.el-select-dropdown__item.selected {
  color: black;
}


.el-button {
  margin-left: 10px;
  height: 30px;
  /* color: #465b66; */
}

.el-button:hover {
  color: white;
  border-color: rgb(97, 126, 141);
  background-color: rgb(89, 116, 129);
  outline: 0;
}

.el-button:focus {
  color: white;
  border-color: #455964;
  background-color: #455964;
  outline: 0;
}

.el-dropdown-menu .el-dropdown-menu__item {
  color: #455964;
}

.el-dropdown-menu .el-dropdown-menu__item:hover {
  color: #455964;
  background-color: #f5f7fa;
}

.sliderbox {
  width: 170px;
}

/* .el-slider {
  width: 115px;
  padding-left: 15px;
} */

.el-slider__bar {
  background: #797979;
}

.el-slider__button {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
}

.el-slider__bar {
  background: #797979;
}

.el-slider__button {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
}
</style>
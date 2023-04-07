<template>
  <el-card class="box-card">
    <template #header>
      <div class="title-background">
      <div class="title-text">
        <span>Over View</span>
      </div>
    </div>
    </template>
    <div id="OverviewMain"></div>
  </el-card>
</template>

<script setup>



import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Edit,
  Share,
} from '@element-plus/icons-vue'

import { onMounted, reactive, watch, ref, toRaw } from "vue-demi";
import { OverView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"
// import getScatter from '@/'

// 离线数据
import scatter from '@/data/scatter.json';
// import { getScatterData } from '@/api/overview.js'


let scatterData = ref(0);
onMounted(() => {
  setTimeout(() => {
    scatterData.value = scatter;
  }, 200);

})


let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('OverviewMain');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;

  renderInstance = new OverView({ width: viewWidth, height: viewHeight }, ele);
  const tooltip = new TooltipClass({ width: 200, height: 200 }, ele, 'global-tooltip');
  getTooltipInstance(tooltip);
})

// 这里开始绘制散点图
watch(scatterData, () => {
  // console.log('绘制散点图: ', toRaw(scatterData.value))
  renderInstance.joinData(toRaw(scatterData.value));
  renderInstance.render();
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');

#OverviewMain {
  height: 290px;
}

#text {
  position: absolute;
  left: 5px;
}

#buttonDiv {
  padding-bottom: 1.2px;
  padding-left: 77px;
}

.transButton {
  height: 25px;
}
</style>
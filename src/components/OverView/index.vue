<template>
  <el-card class="box-card overview-card">
    <template #header>
      <div style = "margin-right: 13px; margin-top: 2px;">
        <svg t="1673965836466" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="13410" width="12" height="12">
          <path
            d="M341.317818 398.242909H113.757091A114.129455 114.129455 0 0 1 0 284.392727V113.757091C0 51.2 51.2 0 113.757091 0h227.607273c62.557091 0 113.757091 51.2 113.757091 113.757091v170.682182c0 62.603636-51.2 113.803636-113.803637 113.803636z m0 625.757091H113.757091A114.129455 114.129455 0 0 1 0 910.242909v-284.485818C0 563.2 51.2 512 113.757091 512h227.607273c62.557091 0 113.757091 51.2 113.757091 113.757091v284.485818C455.121455 972.8 403.921455 1024 341.317818 1024z m568.925091-512h-227.607273a114.129455 114.129455 0 0 1-113.757091-113.757091V113.757091C568.878545 51.2 620.078545 0 682.682182 0h227.560727C972.8 0 1024 51.2 1024 113.757091v284.485818C1024 460.8 972.8 512 910.242909 512z m0 512h-227.607273a114.129455 114.129455 0 0 1-113.757091-113.757091v-170.682182c0-62.603636 51.2-113.803636 113.803637-113.803636h227.560727c62.557091 0 113.757091 51.2 113.757091 113.803636v170.682182C1024 972.8 972.8 1024 910.242909 1024z"
            fill="#2c2c2c" p-id="13411"></path>
        </svg>
      </div>
      <div class="card-header">
        <span>OverView</span>
      </div>
      <!-- <el-button-group id="buttonDiv">
        <el-button type="info" plain="false" size="small" class='transButton' id='tSNE'>tSNE</el-button>
        <el-button type="info" plain="false" size="small" class='transButton' id='PCA'>PCA</el-button>
        <el-button type="info" plain="false" size="small" class='transButton' id='MDS'>MDS</el-button>
      </el-button-group> -->
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
  // async function getScatter() {
  //   let reqDiag = (await getScatterData()).data;
  //   // console.log(reqDiag);
  //   let l = reqDiag.length;
  //   let m = [];
  //   for (let i = 0; i < l; i++) {
  //     let container_t = {
  //       "bat_index": 0,
  //       "cat_index": 0,
  //       "good": 0,
  //       "bad": 0,
  //       "no": 0,
  //       "x": 0,
  //       "y": 0,
  //       "pca_x": 0,
  //       "pca_y": 0,
  //       "MDS_x": 0,
  //       "MDS_y": 0,
  //       "details": {
  //         "production_rhythm": 0,
  //         "heating_mean": [],
  //         "rolling_mean": [],
  //         "cooling_mean": [],
  //         "total_mean": [],
  //         "total_var": []
  //       }
  //     }
  //     container_t.bat_index = reqDiag[i].bat_index;
  //     container_t.cat_index = reqDiag[i].cat_index;
  //     container_t.good = reqDiag[i].good_flag;
  //     container_t.bad = reqDiag[i].bad_flag;
  //     container_t.no = reqDiag[i].no_flag;
  //     container_t.x = reqDiag[i].x;
  //     container_t.y = reqDiag[i].y;
  //     container_t.pca_x = reqDiag[i].pca_x;
  //     container_t.pca_y = reqDiag[i].pca_y;
  //     container_t.MDS_x = reqDiag[i].MDS_x;
  //     container_t.MDS_y = reqDiag[i].MDS_y;
  //     container_t.details.production_rhythm = reqDiag[i].detail.proRhythm;
  //     container_t.details.heating_mean = reqDiag[i].detail.heating_mean;
  //     container_t.details.rolling_mean = reqDiag[i].detail.rolling_mean;
  //     container_t.details.cooling_mean = reqDiag[i].detail.cooling_mean;
  //     container_t.details.total_mean = reqDiag[i].detail.total_mean;
  //     container_t.details.total_var = reqDiag[i].detail.total_var;
  //     m.push(container_t);
  //     //   setTimeout(() => {
  //     //   scatterData.value = m;
  //     //  }, 200);
  //   }
  setTimeout(() => {
    scatterData.value = scatter;
  }, 200);
  // }
  // getScatter()
  // // 模拟promise获取数据
  // let t = [];
  // let n = scatter.length;
  // for (let i = 0; i < 15; i++) {
  //   t.push(scatter[Math.floor(Math.random() * n)]);
  // }
  // setTimeout(() => {
  //   scatterData.value = t;
  // }, 2000);
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

.overview-card {
  margin-top: 10px;
}

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
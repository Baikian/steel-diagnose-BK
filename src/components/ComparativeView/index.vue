<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <div id="ComparativeView">
      <div id = 'buttonDiv'>
        <span id = 'text'>sort by:</span>
        <button class= 'button' id = 'yieldSort'>yield</button>
        <button class= 'button' id = 'qualitySort'>quality</button>
        <button class= 'button' id = 'matchSort'>match</button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue-demi";
import { ComparativeView } from "./main";
import { getTooltipInstance } from "./modules/Series";
import TooltipClass from "@/components/Tooltip/main";
import { cloneObject } from "@/utils";

// 离线数据
import comparativeDataMock from "@/data/data1.json";

let comparativeData = ref(0);
onMounted(() => {
  // 模拟promise获取数据
  setTimeout(() => {
    comparativeData.value = comparativeDataMock.steelData;
  }, 500);
});

// let renderInstance = null;
// onMounted(() => {
//   const ele = document.getElementById("ComparativeView");
//   const viewWidth = ele.offsetWidth;
//   const viewHeight = ele.offsetHeight;
//   renderInstance = new ComparativeView(
//     { width: viewWidth, height: viewHeight },
//     ele
//   );

//   //鼠标悬停提示框
//   // const eleParent = document.getElementById('ComparativeView');
//   // const tooltip = new TooltipClass({ width: 200, height: 200 }, eleParent, 'global-tooltip');
//   // getTooltipInstance(tooltip);
// });

// // 这里开始绘制对比视图
// watch(comparativeData, () => {
//   //const raw = toRaw(comparativeData.value);
//   renderInstance.joinData(comparativeData.value);
//   renderInstance.render();
// });
</script>

<style>
@import url("@/assets/style/MyCard.scss");
#ComparativeView {
  height: 700px;
}
#buttonDiv{
  position: relative;
  text-align:right;
}
#text{
   position: absolute;
  left: 5px;
}
.button {
    background-color: #edeeed; /* Green */
    border: 1px solid rgb(126, 131, 126);
    border-radius: 4px;
    color: rgb(8, 8, 8);
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 13px;
    cursor: pointer;
}
</style>
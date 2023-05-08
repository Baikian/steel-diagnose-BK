<template>
  <el-card class="detail-box-card">
    <template #header>
      <div class="title-background">
        <div class="title-text">
          <span>Detail View</span>
        </div>
      </div>
    </template>
    <div id="ComparativeView" :style="{ overflow: 'auto' }">
      
    
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue-demi";
import { ComparativeView } from "./main";
// import { getTooltipInstance } from "./modules/Series";
import TooltipClass from "@/components/Tooltip/main";
import { cloneObject } from "@/utils";
import test from "./test.json";
import { Whatifview } from "./main";
// 离线数据
import comparativeDataMock from "@/data/data1.json";
let renderInstance = null;
let comparativeData = ref(0);
onMounted(() => {
  // 模拟promise获取数据
  setTimeout(() => {
    comparativeData.value = comparativeDataMock.steelData;
  }, 500);
  const ele = document.getElementById("ComparativeView");
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new Whatifview(
    { width: viewWidth, height: viewHeight },
    ele
  );
  renderInstance.join(test).render();
});

// 这里开始绘制对比视图
watch(comparativeData, () => {
  //const raw = toRaw(comparativeData.value);
  renderInstance.joinData(comparativeData.value);
});
</script>

<style>
@import url("@/assets/style/MyCard.scss");
.detail-box-card{
  margin-top: 10px;
  border-left: 0px;
}
#ComparativeView {
  height:933px;
}
#buttonDiv {
  height: 250px;
  position: relative;
  text-align: right;
}
#text {
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
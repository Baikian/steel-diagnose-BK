<template>
  <el-card class="box-card overview-card">
    <template #header>
      <div class="title-background">
        <div class="title-text">
          <span>Project&nbsp;&nbsp;View</span>
        </div>
      </div>
      <div class="button-group">
        <el-radio-group class='switch' v-model="radio" fill="#455964">
          <el-radio-button label="A" />
          <el-radio-button label="B" />
        </el-radio-group>

        <el-select class='select' v-model="value" placeholder="select" :popper-append-to-body="false"
          @change="handleChange">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"
            :disabled="item.disabled" />
        </el-select>
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
import { eventBus } from '@/utils';
import { onMounted, reactive, watch, ref, toRaw } from "vue-demi";
import { OverView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"
// 离线数据
import scatter from '@/data/scatter-3.json';
// import { getScatterData } from '@/api/overview.js'

const radio = ref('A')
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

function handleChange(newValue) {
  eventBus.emit('select监听', { data: newValue });
}

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

// 绘制散点图
watch(scatterData, () => {
  renderInstance.joinData(toRaw(scatterData.value));
  renderInstance.render();
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');

.el-card__header {
  display: flex;
}

.overview-card {
  margin-top: 0px;
  margin-left: 0px;
}

#OverviewMain {
  height: 361px;
}

.button-group {
  display: flex;
  align-items: center;
  width: 190px;
  height: 35px;
}

.switch .el-radio-button__inner {
  width: 45px;
  height: 30px;
  font-size: 13px;
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
  border-color: #dcdfe6 !important;
  padding-left: 10%;
  padding-right: 25%;
  text-align: center;
}

.select .el-input.is-focus .el-input__inner {
  border-color: #dcdfe6 !important;
}

.select .el-input .el-input__suffix {
  right: 5px;
}

.el-select-dropdown__item.selected {
  color: black;
}

/* .select .el-select-dropdown {
  background-color: transparent;
  border: 1px solid green;
} */

/* 设置下拉框的字体属性及背景颜色； */
/* .select .el-select-dropdown__item {
  font-size: 7px;
  line-height: 19px;
  color: black;
  font-weight: 280;
} */


/* 设置下拉框列表的 padding 值为：0；(即：样式调整) */
/* .select .el-select-dropdown__list {
  padding: 100;
} */

/* 设置鼠标悬停在下拉框列表的悬停色； */
/* .el-select-dropdown__item:hover {
  background-color: grey;
} */
</style>
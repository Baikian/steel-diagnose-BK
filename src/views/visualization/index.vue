<template>
  <div class="container">
    <el-row class="title-content">
      <div id='system-icon'>
        <img  src="./title-icon.svg" width="28" height="28">
      </div>
      <div id='system-title'>
        <text >CIProcDVis</text>
      </div>
    </el-row>
    <el-row class="visual-content">
      <el-col :span="5">
        <parallel></parallel>
        <overview></overview>
      </el-col>
      <el-col :span="15">
        <what-if></what-if>
      </el-col>
      <el-col :span="4">
        <comparative-view></comparative-view>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import WhatIf from '@/components/WhatIf/index.vue';
import ComparativeView from '@/components/ComparativeView/index.vue';
import Overview from '@/components/OverView/index.vue';
import Parallel from '@/components/ControlPanel-4/index.vue';

</script>

<style lang="scss" scoped>
@import url('https://fonts.font.im/css?family=Lato:700,700i');

.container {
  background-color: white;
  border-width: 5px;
  border-color: rgb(211, 211, 211);
  border-style: solid;
  height: 1050px;
}

.title-content {
  display: flex;
  align-items: center;
  /* 垂直居中 */
  background-color: #455964;
  height: 50px;
}

#system-icon {
  margin-top: 5px;
  margin-left: 30px;
}

#system-title {
  margin-left: 20px;
  color: white;
  font-family: 'Lato', sans-serif;
  font-weight: 200;
  font-size: 24px;
}
</style>
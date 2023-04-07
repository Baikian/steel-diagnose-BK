<template>
  <el-row class="visual-content">
    <el-col :span="4">
      <system-title></system-title>
      <control-panel></control-panel>
      <parallel></parallel>
      <overview></overview>
    </el-col>
    <el-col :span="16">
      <what-if class="what-if-content"></what-if>
    </el-col>
    <el-col :span="4">
      <comparative-view class="comparative-view"></comparative-view>
    </el-col>
  </el-row>
</template>

<script setup>
import SystemTitle from '@/components/SystemTitle/index.vue';
import WhatIf from '@/components/WhatIf/index.vue';
import ComparativeView from '@/components/ComparativeView/index.vue';
import ControlPanel from '@/components/ControlPanel';
import Overview from '@/components/OverView/index.vue';
import Parallel from '@/components/ControlPanel-3/index.vue';

</script>

<style lang="scss" scoped>
.visual-content {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 14px;
  background-color: #455964;
}
.what-if-content {
  margin: 4px 0px 4px 4px;
}

.comparative-view {
  margin: 4px 4px 4px 4px;
}

</style>
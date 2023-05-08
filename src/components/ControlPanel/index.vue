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
        <el-col :span="24">
          <div class="outerbox">
            <div class="block">
              <el-date-picker v-model="value1" type="daterange" start-placeholder="Begin" end-placeholder="End"
                :default-value="[new Date(2020, 4, 1), new Date(2020, 5, 1)]" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue-demi";
import { Calendar, Search } from '@element-plus/icons-vue'

const value1 = ref('')

</script>

<style scoped>
@import url('@/assets/style/MyCard.scss');

.controlpanel-card {
  background-color: white;
  margin-top: 10px;
  margin-left: 0px;
  border-bottom: 0px;
}

.ControlPanelMain {
  top: 40px;
  width: 300px;
  height: 50px;
}

.el-row {
  margin-bottom: 0px;
}

.el-row:last-child {
  margin-bottom: 0;
}

/* 时间设置 */
.outerbox {
  display: flex;
  width: 100%;
  padding-top: 3px;
  flex-wrap: wrap;
}

.outerbox .block {
  padding: 10px 0px 10px 0px;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.outerbox .block>>>.el-input__inner {
  background-color: white !important;
  height: 35px;
  width: 94%;
}

</style>
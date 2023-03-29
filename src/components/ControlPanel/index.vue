<template>
  <el-card class="box-card controlpanel-card">
    <template #header>
      <div class="title-background">
      <div class="title-text">
        <span>ControlPanel</span>
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

    
      <el-row class="hang">
        <el-col :span="1">
          <div class="left">
          </div>
        </el-col>
        <el-col :span="9">
          <div class="left">
            <span class="text">Plate Thickness:</span>
          </div>
        </el-col>
        <el-col :span="14">
          <div class="right">
            <el-slider v-model="value2" />
          </div>
        </el-col>
      </el-row>

      <el-row class="hang">
        <el-col :span="1">
          <div class="left">
          </div>
        </el-col>
        <el-col :span="9">
          <div class="left">
            <span class="text">Plate Width:</span>
          </div>
        </el-col>
        <el-col :span="14">
          <div class="right">
            <el-slider v-model="value3" />
          </div>
        </el-col>
      </el-row>

      <el-row class="hang">
        <el-col :span="1">
          <div class="left">
          </div>
        </el-col>
        <el-col :span="9">
          <div class="left">
            <span class="text">Plate Length:</span>
          </div>
        </el-col>
        <el-col :span="14">
          <div class="right">
            <el-slider v-model="value4" />
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

const radio = ref('1')

const input2 = ref('')

const value2 = ref(0)
const value3 = ref(0)
const value4 = ref(0)

const value5 = ref('')

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]

const value6 = ref(0)

</script>

<style scoped>
@import url('@/assets/style/MyCard.scss');

.controlpanel-card{
  border-bottom: 0px;
}

.ControlPanelMain {
  top: 40px;
  width: 300px;
  height: 210px;
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



.hang {
  padding: 15px 0px 0px 0px;
}

.left {
  padding: 7px 0px 0px 0px;
  text-align: left;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
  font-size: 14px;
}

.left .text-range {
  padding: 10px 0px 0px 0px;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
  font-size: 14px;
}

.right .el-input__inner {
  background-color: white !important;
  height: 35px;
  width: 100%;
}

.right >>> .el-radio-group__inner {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
}

.right {
  display: flex;
  align-items: center;
  padding: 0% 4% 0% 0%;
}

.right .demonstration+.el-slider {
  flex: 0 0 0;
}

.el-slider {
  width: 115px;
  padding-left: 15px;
}

.right>>>.el-slider__bar {
  background: #797979;
}

.right>>>.el-slider__button {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
}

.lastslider>>>.el-slider__bar {
  background: #797979;
}

.lastslider>>>.el-slider__button {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
} 
</style>
<template>
  <el-card class="box-card">
    <template #header>
      <div style="margin-right: 13px; margin-top: 2px;">
        <svg t="1673965136682" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="2397" width="13" height="13">
          <path d="M93.090909 0h93.090909v1024H93.090909z" fill="#2c2c2c" p-id="2398"></path>
          <path
            d="M139.636364 311.854545m-139.636364 0a139.636364 139.636364 0 1 0 279.272727 0 139.636364 139.636364 0 1 0-279.272727 0Z"
            fill="#2c2c2c" p-id="2399"></path>
          <path d="M465.454545 0h93.09091v1024h-93.09091z" fill="#2c2c2c" p-id="2400"></path>
          <path
            d="M512 721.454545m-139.636364 0a139.636364 139.636364 0 1 0 279.272728 0 139.636364 139.636364 0 1 0-279.272728 0Z"
            fill="#2c2c2c" p-id="2401"></path>
          <path d="M837.818182 0h93.090909v1024h-93.090909z" fill="#2c2c2c" p-id="2402"></path>
          <path
            d="M884.363636 311.854545m-139.636363 0a139.636364 139.636364 0 1 0 279.272727 0 139.636364 139.636364 0 1 0-279.272727 0Z"
            fill="#2c2c2c" p-id="2403"></path>
        </svg>
      </div>
      <div class="card-header">
        <span>Control Panel</span>
      </div>
    </template>

    <div id="ControlPanelMain">
      <el-row>
        <el-col :span="24">
          <div class="outerbox">
            <div class="block">
              <el-date-picker v-model="value1" type="daterange" start-placeholder="Begin" end-placeholder="End"
                :default-value="[new Date(2010, 9, 1), new Date(2010, 10, 1)]" />
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 滑块 -->
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

#ControlPanelMain {
  height: 200px;
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

/* 标题 */
.title {
  text-align: center;
  display: block;
  color: #6d7885;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
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

/* .right >>> .el-radio-group__inner {
  background: white;
  border-color: #6d7885;
  width: 16px;
  height: 16px;
} */

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
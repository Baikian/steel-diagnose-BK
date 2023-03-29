<template>
  <el-card class="box-card">
    <div class="title-background">
      <span class="title-text">What-If Analysis</span>
    </div>
  </el-card>
</template>

<script>
import { defineComponent } from "vue-demi";

export default defineComponent({
  name: 'Title',
});
</script>

<style lang="scss" scoped>
.el-card{
  height: 50px;
  background-color: white;
  border: solid 1.5px#b3b3b3;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.title-text {
  font-size: 19px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bolder;
  align-content: center;
}
</style>
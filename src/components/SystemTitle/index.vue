<template>
  <el-card class="box-card title-card">
    <template #header>
      <div class="title-background">
      <div class="title-text">
        <span>What-If Analysis</span>
      </div>
    </div>
    </template>
  </el-card>
</template>

<script>
import { defineComponent } from "vue-demi";

export default defineComponent({
  name: 'Title',
});
</script>

<style lang="scss" scoped>
@import url("@/assets/style/MyCard.scss");

.title-card {
  margin-bottom: 10px;
}
</style>
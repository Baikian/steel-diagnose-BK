<template>
  <div class="system-title">
    <span id = 'title-text'>Diagnose System</span>
  </div>
</template>

<script>
import { defineComponent } from "vue-demi";

export default defineComponent({
  name: 'Title',
});
</script>

<style lang="scss" scoped>
@import url("@/assets/style/MyCard.scss");

.system-title {
  margin-bottom: 5px;
  padding-top: 10px;
  padding-left: 10px;
  border-radius: 0px;
  height: 35px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
  background-color: #455964;
}
#title-text {
  color: white;
  font-size: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bolder;
  justify-content: center;
  align-content: center;
}
</style>
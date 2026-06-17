<template>
  <div class="container">
    <router-view />
  </div>
</template>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
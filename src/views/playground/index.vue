<template>
  <a href="https://www.baidu.com" target="_blank">
    <span @click.prevent="handleClick">baidu</span>
  </a>
</template>

<script setup>
function handleClick(){
  console.log(123123);
}
</script>
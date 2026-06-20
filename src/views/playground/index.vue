<template>
    <div class="container">
        <div class="wrapper" draggable="true" @click.stop @dragstart.stop="handleDragstart">
            <div class="inner" draggable="true" @click.stop @dragstart.stop="handleDragstart">
                <button class="button" @click.stop draggable="true" @dragstart.stop="handleDragstart">click</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const handleDragstart = (e: DragEvent) => {
  console.log(e);
};
</script>

<style lang="less" scoped>
.container {
    width: 100%;
    height: 100%;

    .wrapper {
        width: 300px;
        height: 300px;
        background: red;
        padding: 100px;
        
        .inner {
            padding: 100px;
            width: 200px;
            height: 200px;
            background: green;
        }
    }
}
</style>
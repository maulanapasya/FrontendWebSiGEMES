<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style>
/* Global styles */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* background-color: #f7f9fc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, sans-serif; */
}

.app-container {
  width: 100%;
  height: 100%;
}
</style>

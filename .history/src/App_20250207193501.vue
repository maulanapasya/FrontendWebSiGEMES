<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style>
/* Reset semua margin dan padding */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Pastikan body dan html memiliki tinggi 100% dan latar belakang putih */
html, body {
  width: 100%;
  height: 100%;
  background-color: #f7f9fc; /* Sesuaikan dengan warna dari Screenshot 2 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, sans-serif;
  overflow: hidden; /* Pastikan tidak ada elemen ekstra yang bisa membuat scroll */
}

/* Pastikan router-view memenuhi seluruh layar */
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

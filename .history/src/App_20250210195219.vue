<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nama Web Anda</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>

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
  background-color: #f7f9fc;
  font-family: 'Poppins', sans-serif;
  font-weight: 600; /* Semi-bold */
}

.app-container {
  width: 100%;
  height: 100%;
}
</style>

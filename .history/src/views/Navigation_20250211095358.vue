<template>
    <nav>
      <ul>
        <li>Dashboard</li>
        <li>Data Gedung Nasional</li>
        <li>Data Ruang Mess</li>
        <li>Data Admin</li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'Navigation',
  };
  </script>
  
  <style scoped>
  nav ul {
    list-style-type: none;
    padding: 0;
  }
  
  nav ul li {
    font-family: 'Poppins', sans-serif;
    display: inline;
    margin-right: 20px;
  }
  </style>
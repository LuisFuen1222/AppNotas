<!-- NotaCard.vue -->
<template>
    <div>
      <h4>{{ titulo }}</h4>
      <p>{{ contenido }}</p>
      <small>{{ fecha }}</small>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      titulo: String,
      contenido: String,
      fecha: String
    }
  }
  </script>
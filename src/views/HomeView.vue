<template>
  <div class="container">
    <div class="sidebar">
      <h2>Menu</h2>
      <ul class="links">
        <button class="Notas"><RouterLink to="{ name: 'home' }" style="color: white;"> Notas </RouterLink></button>
        <br/>
        <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Notas Favoritas </RouterLink>
        <br/>
        <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Eliminados </RouterLink>
        <br/>
        <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Notas Archivadas </RouterLink>
        <br/>
      </ul>
      <button class="logout-btn">Cerrar sesión</button>
    </div>
    <div class="content">
      <div class="new-note">
        <h2>Añadir Nota</h2>
        <input placeholder="Título" v-model="nuevoTitulo" />
        <textarea placeholder="Nota importante..." v-model="nuevaNota"></textarea>
      </div>
      <div class="notes-list">
        <h3>Mis notas</h3>
      </div>
    </div>
  </div>
</template>

<script setup type="ts">

</script>

<style scoped>
.container {
  display: flex;
}

.sidebar {
  background-color: #6aa8ff;
  color: white;
  padding: 150px;
  width: 100px;
  height: -500px;
  top: 80px;
  left: -10px;
  position:absolute;
}

.logout-btn {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 20px;
  cursor: pointer;
}

.content {
  padding: 20px;
  flex: 1;
}

.new-note {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
}
.Notas{
  background-color: rgb(0, 22, 95);
}

.new-note input,
.new-note textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.notes-list {
  background-color: white;
  padding: 20px;
}
</style>
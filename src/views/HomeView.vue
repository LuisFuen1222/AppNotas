<template>
  <div class="container">
    <div class="sidebar">
      <h1 class="Menu">Menú</h1>
      <ul class="links">
        <br />
        <div class="letras">
          <button class="Notas">
          <RouterLink to="{ name: 'home' }" style="color: white;">
            <h2>Notas</h2>
          </RouterLink>
        </button>
        <br />
          <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Notas Favoritas </RouterLink>
          <br />
          <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Eliminados </RouterLink>
          <br />
          <RouterLink to="{ name: 'home' }" style="color: #002b66;"> Notas Archivadas </RouterLink>
          <br />
          <RouterLink to="/"> <button class="logout-btn">Cerrar sesión</button> </RouterLink>
        </div>
        <br />
      </ul>
      
    </div>
    <div class="content">
      <div class="new-note" id="editor">
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
  display: block;
}

.sidebar {
  background-color: #6aa8ff;
  color: white;
  padding: 150px;
  width: 60px;
  max-width: none;
  height: 100%;
  top: 80px;
  left: -10px;
  position:absolute;
  margin-top: -80px;
}

.logout-btn {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 20px;
  cursor: pointer;
  border-radius: 8px;
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
  border-radius: 8px;
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

.container .sidebar .Menu{
  align-items: end;
  position: relative;
  left: -60px;
  top: -20px;
  font-size: 3rem;
}

.letras{
  font-size: 1.5rem;
  margin-left: -130px;
  display: grid;
  text-align: justify;
  white-space: nowrap;
}
</style>
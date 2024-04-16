<template>
  <div class="container">
    <div class="sidebar" style="position: fixed;">
      <h1 class="Menu">Menú</h1>
      <ul class="links">
        <br />
        <div class="letras">
          <RouterLink :to="{ name: 'home' }" style="color: #002b66;"> Notas </RouterLink>
          <br />
          <RouterLink :to="{ name: 'favoritos' }" style="color: #002b66;"> Notas Favoritas </RouterLink>
          <br />
          <button class="Papelera">
            <RouterLink :to="{ name: 'papelera' }" style="color: white;">
              <h2>Papelera</h2>
            </RouterLink>
          </button>
          <br />
          <RouterLink :to="{ name: 'archivados' }" style="color: #002b66;"> Notas Archivadas </RouterLink>
          <br />
          <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
        </div>
        <br />
      </ul>
    </div>
    <div>
      <h1 class="titulo"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#00165F" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M4 7l16 0" />
  <path d="M10 11l0 6" />
  <path d="M14 11l0 6" />
  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
</svg>Notas en la papelera</h1>
    </div>
    <div class="notes-list">
      <div v-for="nota in notas" :key="nota.id" class="card">

          <button @click="restaurarNota(nota)"><svg xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-rotate" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="#00165F" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
            </svg></button>
          <button @click="eliminarNotaPermanentemente(nota)"><svg xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-trash" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="#00165F" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg></button>

        <h3>{{ nota.title }}</h3>
        <p>{{ nota.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup type="ts">
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { db } from '../main'

const trashCollection = db.collection('trash');
const notesCollection = db.collection('notes');

const notas = ref([]);
const router = useRouter();

onMounted(() => {
  trashCollection.onSnapshot((snapshot) => {
    notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, (error) => {
    console.error('Error al obtener las notas: ', error);
  });
})

const restaurarNota = (nota) => {
  const trashRef = trashCollection.doc(nota.id);
  trashRef.get().then((doc) => {
    if (doc.exists) {
      const noteRef = notesCollection.doc(nota.id);
      noteRef.set(doc.data()).then(() => {
        trashRef.delete().then(() => {
          Swal.fire('Nota restaurada', '', 'success');
        }).catch((error) => {
          console.error('Error al eliminar la nota de la papelera: ', error);
          Swal.fire('Error', 'Ocurrió un error al eliminar la nota de la papelera', 'error');
        });
      }).catch((error) => {
        console.error('Error al restaurar la nota: ', error);
        Swal.fire('Error', 'Ocurrió un error al restaurar la nota', 'error');
      });
    } else {
      console.log('No se encontró la nota en la papelera');
      Swal.fire('Error', 'No se encontró la nota en la papelera', 'error');
    }
  }).catch((error) => {
    console.error('Error al obtener la nota de la papelera: ', error);
    Swal.fire('Error', 'Ocurrió un error al obtener la nota de la papelera', 'error');
  });
}

const eliminarNotaPermanentemente = (nota) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar'
  }).then((result) => {
    if (result.isConfirmed) {
      trashCollection.doc(nota.id).delete()
        .then(() => {
          Swal.fire('Nota eliminada', '', 'success');
        })
        .catch((error) => {
          console.error('Error al eliminar la nota: ', error);
          Swal.fire('Error', 'Ocurrió un error al eliminar la nota', 'error');
        });
    }
  });
}

</script>

<style scoped>
.container {
  display: block;
}

.boton {
  background-color: #6aa8ff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
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
  position: absolute;
  margin-top: -80px;
}

.Papelera {
  background-color: rgb(0, 22, 95);
  border-radius: 8px;
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


.new-note input,
.new-note textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.notes-list {
  background-color: white;
  padding: 60px;
  display: grid;
  gap: 50px;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  margin-left: 250px;
  align-items: end;

}


.container .sidebar .Menu {
  align-items: end;
  position: relative;
  left: -60px;
  top: -20px;
  font-size: 3rem;
}

.letras {
  font-size: 1.5rem;
  margin-left: -130px;
  display: grid;
  text-align: justify;
  white-space: nowrap;
}

.card {
  padding: 40px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  color: black;

}

.card h3{
font-weight: bold;
color: rgb(0, 22, 95);

}

.titulo {
  margin-bottom: 25px;
  margin-left: 300px;
  color: rgb(0, 22, 95);
}




@media (max-width: 800px) {
  .element {
    width: 100%;
    background-color: blue;
  }
}

@media only screen and (max-width: 600px) {}

@media only screen and (min-width: 601px) {}
</style>
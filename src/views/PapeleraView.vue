<template>
  <div class="container">
    <div class="container-searchbar">
        <div class="search-bar">
          <input v-model="search" placeholder="Buscar por título" class="buscador" />
          <div class="search-icon">
            <button class="butlupa"><i class="bi bi-search"></i></button>
          </div>
        </div>   
      </div>
  <header>
    <h1 class="titulo">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="32" height="32"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round"
        stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 7l16 0" />
        <path d="M10 11l0 6" />
        <path d="M14 11l0 6" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
      </svg>
      Eliminados
    </h1>
  </header>
  
  <Sidebar/>
  <div class="main-content">
    <div class="notes-list">
      <div v-for="nota in FiltrarNotas" :key="nota.title" class="card">
        <div class="note-content">
          <div class="icons">
        <button @click="restaurarNota(nota)">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rotate" width="16" height="16"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="#00165F" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
          </svg>
        </button>
        <button @click="eliminarNotaPermanentemente(nota)">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="16" height="16"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="#00165F" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </button>
      </div>
        <h3 v-html="nota.title"></h3>
        <p v-html="nota.content"></p>
        <div>{{ formatFecha(nota.date) }}</div>
      </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup type="ts">
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import { db, auth } from '../main'
import { computed } from 'vue'
import { format } from 'date-fns';
import Sidebar from './Sidebar.vue';

const trashCollection = db.collection('trash');
const notesCollection = db.collection('notes');

const notas = ref([]);
const search = ref('');
let unsubscriber;

const formatFecha = (fecha) => {
  if (fecha) {
    const dateObject = new Date(fecha);
    if (isNaN(dateObject.getTime())) {
      console.log('Fecha no válida: ', fecha);
      return '';
    }
    return format(dateObject, 'dd/MM/yyyy HH:mm');
  } else {
    console.log('Fecha no proporcionada');
    return '';
  }
}

onMounted(() => {
  auth.onAuthStateChanged(user => {
    if (user) {
      const userId = user.uid;
      trashCollection.where('user', '==', userId).onSnapshot((snapshot) => {
        notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (error) => {
        console.error('Error al obtener las notas: ', error);
      });
    } else {
      console.error('No user is currently signed in');
    }
  });
});

const FiltrarNotas = computed(() => {
  if (!search.value) {
    return notas.value;
  }
  return notas.value.filter(nota => nota.title.toLowerCase().includes(search.value.toLowerCase()));
});

const restaurarNota = (nota) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres restaurar esta nota de la papelera?',
    showCancelButton: true,
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
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
body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
}


.main-content {
  flex: 1;
  margin-left: 25%;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
}

.content {
  margin-top: 3%;
  position: relative;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  padding: 20px;
}

.boton {
  background-color: #6aa8ff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
}

.notes-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.notes-list .card {
  flex-basis: calc(25% - 20px);
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
}

.notes-list .card .icons button {
  background-color: transparent;
  box-shadow: none;
  border: none;
}

.note-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-icons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icons i {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  box-shadow: none;
}


.titulo {
  margin-bottom: 25px;
  margin-left: 300px;
  color: rgb(0, 22, 95);
  font-size: 2rem;
  position: fixed;
  top: 10px;
  left: 200px;
}

.container-searchbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  margin-right: 59px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.search-bar input.buscador {
  flex: 1;
  margin: 15px;
  border-radius: 20px;
  padding: 10px;
}

.search-icon {
  display: flex;
}

.butlupa {
  background-color: #002559;
  color: rgb(255, 255, 255);
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 100px;
}


.notes-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.notes-list .card {
  flex-basis: calc(25% - 20px);
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
}

.notes-list .card .icons button {
  background-color: transparent;
  box-shadow: none;
  border: none;
}

.note-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-icons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icons i {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  box-shadow: none;
}


@media screen and (max-width: 1200px) {
  .wrapper {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
  }

  .sidebar {
    width: 100%;
    position: relative;
    padding: 20px;
    height: auto;
  }

  .logout-btn {
    margin-top: 20px;
  }

  .content {
    width: 100%;
    margin-top: 20px;
  }

  .notes-list .card {
    flex-basis: calc(50% - 20px);
  }
}

@media screen and (max-width: 768px) {
  .search-bar {
    margin-left: 0;
  }

  .notes-list .card {
    flex-basis: calc(50% - 20px);
  }
}

@media screen and (max-width: 480px) {
  .sidebar,
  .main-content {
    width: 100%;
    position: relative;
    padding: 20px;
    height: auto;
  }

  .content {
    margin-top: 20px;
  }

  .notes-list .card {
    flex-basis: calc(100% - 20px);
  }

  .container-searchbar {
    margin-top: 50px;
    margin-left: auto;
  }

  .search-bar {
    justify-content: center;
  }
}
</style>

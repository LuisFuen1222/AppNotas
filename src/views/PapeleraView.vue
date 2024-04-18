<template>
  <input v-model="search" placeholder="Buscar por título" class="buscador" />
  <div class="lupa">
    <button class="butlupa"><i class="bi bi-search"></i></button>
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
  <div class="container">
    <div class="notes-list">
      <div v-for="nota in FiltrarNotas" :key="nota.title" class="card">
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
        <h3>{{ nota.title }}</h3>
        <p>{{ nota.content }}</p>
        <div>{{ formatFecha(nota.date) }}</div>
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
.container {
  width: 100%;
  padding: 0 15px;
  margin: 0 auto;
}

.boton {
  background-color: #6aa8ff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
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

.card {
  padding: 40px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  color: black;

}

.card h3 {
  font-weight: bold;
  color: rgb(0, 22, 95);

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

.buscador {
  margin-left: 300px;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  top: 10px;
  position: fixed;
  left: 1200px;
}

.lupa {
  right: 80px;
  top: 25px;
  font-size: 1.5rem;
  position: absolute;
  display: flex;
}

.butlupa {
  background-color: #002559;
  color: rgb(255, 255, 255);
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  border-radius: 100px;
  margin-top: 0px;
  margin-right: -20px;
}

.bi-star {
  color: yellow;
}
</style>

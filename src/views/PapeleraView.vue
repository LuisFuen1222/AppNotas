<template>
    <div class="container">
      <div class="sidebar" style="position: fixed;">
      </div>
      <div class="notes-list">
        <h3>Notas en la papelera</h3>
        <div v-for="nota in notas" :key="nota.id" class="card">
          <h4>{{ nota.title }}</h4>
          <p>{{ nota.content }}</p>
          <button @click="restaurarNota(nota)">Restaurar</button>
          <br/>
          <button @click="eliminarNotaPermanentemente(nota)">Eliminar permanentemente</button>
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
 

  </style>
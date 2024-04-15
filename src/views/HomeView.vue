<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"> 
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <div class="container">
    <div class="sidebar" style="position: fixed;">
      <h1 class="Menu">Menú</h1>
      <ul class="links">
        <br />
        <div class="letras">
          <button class="Notas">
            <RouterLink :to="{ name: 'home' }" style="color: white;">
              <h2>Notas</h2>
            </RouterLink>
          </button>
          <br />
          <RouterLink :to="{ name: 'favoritos' }" style="color: #002b66;"> Notas Favoritas </RouterLink>
          <br />
          <RouterLink :to="{ name: 'papelera' }" style="color: #002b66;"> Papelera </RouterLink>
          <br />
          <RouterLink :to="{ name: 'archivados' }" style="color: #002b66;"> Notas Archivadas </RouterLink>
          <br />
          <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
        </div>
        <br />
      </ul>
      
    </div>
    <div class="card">
      <div class="content">
        <div class="new-note" id="editor">
          <h2>Añadir Nota</h2>
          <input v-model="tituloNota" placeholder="Título de la nota" />
          <div id="quill-editor"></div>
          <br/>
          <button @click="guardarNota" class="boton">Guardar Nota</button>
        </div>
      </div>
    </div>

    <div class="notes-list">
      <h3>Mis notas</h3>
      <div v-for="nota in notas" :key="nota.title" class="card">
        <h4>{{ nota.title }}</h4>
        <p>{{ nota.content }}</p>
        <button @click="editarNota(nota)">Editar</button>
        <br/>
        <button @click="borrarNota(nota)">Borrar</button>
        <br/>
        <button @click="marcarComoFavorito(nota)">Favorito</button>
        <br/>
      </div>
    </div>

  </div>

</template>


<script setup type="ts">
import { onMounted, ref } from 'vue'
import Quill from 'quill'
import { db, auth } from '../main'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const notesCollection = db.collection('notes');

const tituloNota = ref('');
const notas = ref([]);
const trashCollection = db.collection('trash');
const favoritesCollection = db.collection('favorites');
let quill = null;
let notaActual = ref(null);
const router = useRouter();

// Inicializar Quill
onMounted(() => {
  quill = new Quill('#quill-editor', {
    theme: 'snow'
  })
  notesCollection.onSnapshot((snapshot) => {
    notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, (error) => {
    console.error('Error al obtener las notas: ', error);
  });
})

// Funcion de guardar nota
const guardarNota = () => {
  const contenido = quill.getText().trim();
  if(contenido === '') {
    Swal.fire('Error', 'El contenido de la nota no puede estar vacío', 'error');
    return;
  }
  if (notaActual.value) {
    // Actualizar la nota existente
    notesCollection.doc(notaActual.value.id).update({
      title: tituloNota.value,
      content: contenido
    })
      .then(() => {
        console.log('Nota actualizada exitosamente');
        tituloNota.value = '';
        quill.setText(''); 
        notaActual.value = null; 
      })
      .catch((error) => {
        console.error('Error al actualizar la nota: ', error);
      });
  } else {
    // Crear una nueva nota
    notesCollection.add({
      title: tituloNota.value,
      content: contenido
    })
      .then(() => {
        console.log('Nota guardada exitosamente');
        tituloNota.value = '';
        quill.setText(''); 
      })
      .catch((error) => {
        console.error('Error al guardar la nota: ', error);
      });
  }
}

// Funcion de editar nota
const editarNota = (nota) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres editar esta nota?',
    showCancelButton: true,
    confirmButtonText: 'Sí, editar',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      tituloNota.value = nota.title;
      quill.setText(nota.content);
      notaActual.value = nota;
    }
  });
}

// Funcion de borrar nota
const borrarNota = (nota) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres mover esta nota a la papelera?',
    showCancelButton: true,
    confirmButtonText: 'Sí, mover a la papelera',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      const noteRef = notesCollection.doc(nota.id);
      noteRef.get().then((doc) => {
        if (doc.exists) {
          const trashRef = trashCollection.doc(nota.id);
          trashRef.set(doc.data()).then(() => {
            noteRef.delete().then(() => {
              console.log('Nota movida a la papelera');
              router.push({ name: 'papelera' });
            }).catch((error) => {
              console.error('Error al eliminar la nota: ', error);
            });
          }).catch((error) => {
            console.error('Error al mover la nota a la papelera: ', error);
          });
        } else {
          console.log('No se encontró la nota');
        }
      }).catch((error) => {
        console.error('Error al obtener la nota: ', error);
      });
    }
  });
}

// Funcion de cerrar sesion
const cerrarSesion = () => {
  Swal.fire({
    title: '¿Estás seguro de que quieres cerrar la sesión?',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      auth.signOut()
        .then(() => {
          router.push({ name: 'login' });
        })
        .catch((error) => {
          console.error('Error al cerrar la sesión:', error);
        });
    }
  });
}

// Funcion de favoritos
const marcarComoFavorito = (nota) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres marcar esta nota como favorita?',
    showCancelButton: true,
    confirmButtonText: 'Sí, marcar como favorita',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      const noteRef = notesCollection.doc(nota.id);
      noteRef.get().then((doc) => {
        if (doc.exists) {
          const favoriteRef = favoritesCollection.doc(nota.id);
          favoriteRef.set(doc.data()).then(() => {
            noteRef.delete().then(() => {
              console.log('Nota marcada como favorita');
              router.push({ name: 'favoritos' });
            }).catch((error) => {
              console.error('Error al eliminar la nota: ', error);
            });
          }).catch((error) => {
            console.error('Error al marcar la nota como favorita: ', error);
          });
        } else {
          console.log('No se encontró la nota');
        }
      }).catch((error) => {
        console.error('Error al obtener la nota: ', error);
      });
    }
  });
}

</script>

<style scoped>
.container {
  display: block;
}

.boton{
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

.Notas {
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
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
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

.card{
  padding: 5%;
  margin-top: 5%;

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
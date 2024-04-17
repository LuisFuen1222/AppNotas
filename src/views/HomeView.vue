<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <div class="container">
    <div class="sidebar" style="position: fixed;">
      <h1 class="Menu">Menú</h1>
      <ul class="links">
        <br />
        <div class="letras">
          <button class="Notas">
            <RouterLink :to="{ name: 'home' }" style="color: white;">
              <i class="bi bi-journal-text"></i>
              <h2>Notas</h2>
            </RouterLink>
          </button>
          <br />
          <RouterLink :to="{ name: 'favoritos' }" style="color: #002b66;"> <i class="bi bi-star"></i> Notas Favoritas
          </RouterLink>
          <br />
          <RouterLink :to="{ name: 'papelera' }" style="color: #002b66;"> <i class="bi bi-trash3"></i> Papelera
          </RouterLink>
          <br />
          <RouterLink :to="{ name: 'archivados' }" style="color: #002b66;"> <i class="bi bi-archive"></i> Notas
            Archivadas </RouterLink>
          <br />
          <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
        </div>
        <br />
      </ul>
    </div>

    <div class="content">
      <div class="card">
        <div class="new-note" id="editor">
          <h2>Añadir Nota</h2>
          <input v-model="tituloNota" placeholder="Título de la nota" />
          <div id="quill-editor"></div>
          <br />
          <button @click="guardarNota" class="boton">Guardar Nota</button>
        </div>
      </div>
    </div>

    <!--
<input v-model="search" placeholder="Buscar por título" class="buscador" />
    <div class="lupa">
      <button class="butlupa"><i class="bi bi-search"></i></button>
    </div>
    <br/>
    <h3><i class="bi bi-journal-text"></i> Mis notas</h3>
    -->

    <div class="search-bar">
      <input v-model="search" placeholder="Buscar por título" class="buscador" />
      <div class="search-icon">
        <button class="butlupa"><i class="bi bi-search"></i></button>
      </div>
    </div>
    <br />
    <h3><i class="bi bi-journal-text"></i> Mis notas</h3>

    <div class="notes-list">
      <div v-for="nota in FiltrarNotas" :key="nota.title" class="card">
        <div class="note-content">
          <h4>{{ nota.title }}</h4>
          <div class="icons">
            <button @click="editarNota(nota)"><i class="bi-pencil-square"></i></button>
            <button @click="borrarNota(nota)"><i class="bi bi-trash3"></i></button>
            <button @click="toggleFavorite(nota)"><i class="bi" :class="nota.isFavorite ? 'bi-star-fill' : 'bi-star'"
                :style="{ color: nota.isFavorite ? 'yellow' : 'black' }"></i></button>
            <button @click="archivarNota(nota)"><i class="bi bi-archive"></i></button>
          </div>
        </div>
        <p>{{ nota.content }}</p>
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
import { computed } from 'vue'

const tituloNota = ref('');
const notas = ref([]);
const notesCollection = db.collection('notes');
const trashCollection = db.collection('trash');
const favoritesCollection = db.collection('favorites');
const archiveCollection = db.collection('archive');
let quill = null;
let notaActual = ref(null);
const router = useRouter();
const search = ref('');
let unsubscriber;

// Inicializar Quill
onMounted(() => {
  quill = new Quill('#quill-editor', {
    theme: 'snow'
  })

  unsubscriber = auth.onAuthStateChanged(user => {
    if (user) {
      notesCollection.where('user', '==', user.uid)
        .onSnapshot((snapshot) => {
          notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }, (error) => {
          console.error('Error al obtener las notas: ', error);
        });
    } else {
      console.error('No user is currently authenticated');
    }
  });
})

const FiltrarNotas = computed(() => {
  if (!search.value) {
    return notas.value;
  }
  return notas.value.filter(nota => nota.title.toLowerCase().includes(search.value.toLowerCase()));
});


const guardarNota = () => {
  const contenido = quill.getText().trim();
  if (contenido === '') {
    Swal.fire('Error', 'El contenido de la nota no puede estar vacío', 'error');
    return;
  }
  if (notaActual.value) {

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

    notesCollection.add({
      title: tituloNota.value,
      content: contenido,
      user: auth.currentUser.uid
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

const archivarNota = (nota) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres archivar esta nota?',
    showCancelButton: true,
    confirmButtonText: 'Sí, archivar',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      const noteRef = notesCollection.doc(nota.id);
      noteRef.get().then((doc) => {
        if (doc.exists) {
          const archiveRef = archiveCollection.doc(nota.id);
          archiveRef.set(doc.data()).then(() => {
            noteRef.delete().then(() => {
              console.log('Nota archivada');
              router.push({ name: 'archivados' });
            }).catch((error) => {
              console.error('Error al eliminar la nota: ', error);
            });
          }).catch((error) => {
            console.error('Error al archivar la nota: ', error);
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
          favoriteRef.set({ ...doc.data(), isFavorite: true }).then(() => {
            // Actualiza la nota original en la colección de notas
            noteRef.update({ isFavorite: true });
            console.log('Nota marcada como favorita');
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

const toggleFavorite = (nota) => {
  nota.isFavorite = !nota.isFavorite;
  if (nota.isFavorite) {
    marcarComoFavorito(nota);
  } else {
    restaurarNota(nota);
  }
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
  left: 190px;
  position: relative;
  width: 100%;
}

.new-note {
  background-color: white;
  padding: 20px;
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
  padding: 20px;
  display: grid;
  gap: 90px;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  margin-left: 42.5%;
  height: 50%;
  width: 100%;
  margin-left: 250px;
}

.notes-list .card {
  min-width: none;
  width: 150%;
  height: 100%;
  margin-right: 20px;
}


.note-content {
  display: flex;
  
}

.icons {
  display: flex;
  justify-content: flex-end;
  margin-left: 25%;
  
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
  padding: 5%;
  margin-top: 5%;
  padding: 40px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  color: black;
  margin-inline: 10%;
  width: 112.5%;
}

.butlupa {
  background-color: #002559;
  color: rgb(255, 255, 255);
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 100px;
}


.search-bar {
  display: flex;
  align-items: center;
  margin-left: 105%;
  margin-top: 1%;
}

.search-bar input {
  flex: 1;
  margin: 15px;
}

.search-icon {
  display: flex;
}



@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

.sidebar {
  width: 100%;
}

@media (min-width: 992px) {
  .sidebar {
    width: 25%;
    position: fixed;
  }

}

.bi-star {
  color: yellow;
}
</style>
<template>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
    crossorigin="anonymous"
    />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
    rel="stylesheet"
    />
  <div class="wrapper">
    
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>Notas</h1>
      </div>
      <div class="letras">
        <button class="notas">
          <RouterLink :to="{ name: 'home' }" class="enlace-router">
            <i class="bi bi-journal-text"></i>
            <h3 style="margin-left: 5px; margin: 0">Notas</h3>
          </RouterLink>
        </button>
        <div class="exep-notas">
          <RouterLink :to="{ name: 'favoritos' }" class="enlace-router">
            <i class="bi bi-star"></i>
            <span class="texto-enlace">Notas Favoritas</span>
          </RouterLink>
          <RouterLink :to="{ name: 'papelera' }" class="enlace-router">
            <i class="bi bi-trash3"></i>
            <span class="texto-enlace">Papelera</span>
          </RouterLink>
          <RouterLink :to="{ name: 'archivados' }" class="enlace-router">
            <i class="bi bi-archive"></i>
            <span class="texto-enlace">Notas Archivadas</span>
          </RouterLink>
        </div>
        <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </div>

    
    <div class="main-content">
      <div class="content">
        <div class="new-note" id="editor">
          <h2>Añadir Nota</h2>
          <input v-model="tituloNota" placeholder="Título de la nota" />
          <div id="quill-editor"></div>
          <br />
          <button @click="guardarNota" class="boton">Guardar Nota</button>
        </div>
      </div>

      <div class="container-searchbar">
        <div class="search-bar">
          <input v-model="search" placeholder="Buscar por título" class="buscador" />
          <div class="search-icon">
            <button class="butlupa"><i class="bi bi-search"></i></button>
          </div>
        </div>   
      </div>

      <div class="notes-list">
        <div v-for="nota in FiltrarNotas" :key="nota.title" class="card">
          <div class="note-content">
            <div class="title-icons">
              <h4>{{ nota.title }}</h4>
              <div class="icons">
                <button @click="toggleFavorite(nota)">
                  <i
                    class="bi"
                    :class="nota.isFavorite ? 'bi-star-fill' : 'bi-star'"
                    :style="{ color: nota.isFavorite ? 'yellow' : 'black' }"
                  ></i>
                </button>
                <button @click="editarNota(nota)"><i class="bi bi-pencil"></i></button>
                <button @click="borrarNota(nota)"><i class="bi bi-trash3"></i></button>
                <button @click="archivarNota(nota)"><i class="bi bi-archive"></i></button>
              </div>
            </div>
          </div>
          <p>{{ nota.content }}</p>
          <div>{{ formatFecha(nota.date) }}</div>
        </div>
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
import { format } from 'date-fns'

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
      content: contenido,
      date: Date.now()
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
      user: auth.currentUser.uid,
      date: Date.now()
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

body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
}

.wrapper {
  display: flex;
  flex-direction: row;
}


.sidebar {
  width: 25%;
  height: 100vh;
  background-color: #e3e8f8;
  position: fixed;
  top: 0;
  left: 0;
  padding: 30px;
  box-sizing: border-box;
}

.sidebar-header {
  padding: 10px;
  color: #203562;
  font-weight: 600;
}

.letras i {
  font-size: 1.5em;
  margin-right: 10px;
  margin-left: 10px;
}

.notas {
  background-color: #203562;
  border-radius: 10px;
  padding: 10px;
  width: 100%;
}

.exep-notas i {
  color: #79747e;
}

.enlace-router {
  color: white;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  text-decoration: none;
}

.texto-enlace {
  font-weight: 400;
  color: #79747e;
}

.logout-btn {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 75%;
  cursor: pointer;
  border-radius: 8px;
  width: 100%;
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

.new-note h2 {
  font-weight: 600;
}

.new-note input,
.new-note textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.boton {
  background-color: #203562;
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
}


.container-searchbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
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


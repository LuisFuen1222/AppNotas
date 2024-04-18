<template>
    <input v-model="search" placeholder="Buscar por título" class="buscador" /> <div class="lupa"><button class="butlupa"><i class="bi bi-search"></i></button></div>
    <header><h1 class="titulo"> <i class="bi bi-star"></i> Mis Favoritos</h1></header>
    <div class="container">
      <div class="sidebar" style="position: fixed;">
        <h1 class="Menu">Menú</h1>
        <ul class="links">
          <br />
          <div class="letras">
            <RouterLink :to="{ name: 'home' }" style="color: #002b66;"><i class="bi bi-journal-text"></i>  Notas </RouterLink>
            <br />
            <button class="Papelera">
            <RouterLink :to="{ name: 'favoritos' }" style="color: white;"> <h2><i class="bi bi-star"></i>  Notas Favoritas </h2></RouterLink>
            </button>
            <br />
              <RouterLink :to="{ name: 'papelera' }" style="color: #002b66;">
                <i class="bi bi-trash3"></i> Papelera
              </RouterLink>
            <br />
           
            <RouterLink :to="{ name: 'archivados' }" style="color: #002b66;"> <i class="bi bi-archive"></i> Notas Archivadas </RouterLink>            
            <br />
            <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
          </div>
          <br />
        </ul>
      </div>
  
      <div class="notes-list">
        <div v-for="nota in FiltrarNotas" :key="nota.title" class="card">
  
            <button @click="restaurarNota(nota)"><button @click="restaurarNota(nota)">
  <i class="bi" :class="nota.isFavorite ? 'bi-star-fill' : 'bi-star'" :style="{ color: nota.isFavorite ? 'yellow' : 'black' }"></i>
</button></button>
            <button @click="moverNotaATrash(nota)"><i class="bi bi-trash3"></i></button>   
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
  import { format } from 'date-fns'
  
  const trashCollection = db.collection('trash');
  const notesCollection = db.collection('notes');
  const favoritesCollection = db.collection('favorites');
  
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
      favoritesCollection.where('user', '==', userId).onSnapshot((snapshot) => {
        notas.value = snapshot.docs.map(doc => {
          const nota = { id: doc.id, ...doc.data() };
          nota.isFavorite = true; // Establece isFavorite en true para todas las notas favoritas
          return nota;
        });
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
    title: '¿Estás seguro de que quieres quitar esta nota de tus favoritos?',
    showCancelButton: true,
    confirmButtonText: 'Sí, quitar de favoritos',
    cancelButtonText: 'No, cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      const trashRef = favoritesCollection.doc(nota.id);
      trashRef.get().then((doc) => {
        if (doc.exists) {
          const noteRef = notesCollection.doc(nota.id);
          noteRef.set({ ...doc.data(), isFavorite: false }).then(() => {
            trashRef.delete().then(() => {
              Swal.fire('Nota ya no favorita', '', 'success');
            }).catch((error) => {
              console.error('Error al eliminar la nota de mis favoritos: ', error);
              Swal.fire('Error', 'Ocurrió un error al eliminar la nota de mis favoritos', 'error');
            });
          }).catch((error) => {
            console.error('Error al restaurar la nota: ', error);
            Swal.fire('Error', 'Ocurrió un error al restaurar la nota', 'error');
          });
        } else {
          console.log('No se encontró la nota en mis favoritos');
          Swal.fire('Error', 'No se encontró la nota en mis favoritos', 'error');
        }
      }).catch((error) => {
        console.error('Error al obtener la nota de mis favoritos: ', error);
        Swal.fire('Error', 'Ocurrió un error al obtener la nota de mis favoritos', 'error');
      });
    }
  });
}
  
  const moverNotaATrash = (nota) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción moverá la nota a la papelera',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, mover'
  }).then((result) => {
    if (result.isConfirmed) {
      const archiveRef = favoritesCollection.doc(nota.id);
      archiveRef.get().then((doc) => {
        if (doc.exists) {
          const trashRef = trashCollection.doc(nota.id);
          trashRef.set(doc.data()).then(() => {
            archiveRef.delete().then(() => {
              Swal.fire('Nota movida a la papelera', '', 'success');
            }).catch((error) => {
              console.error('Error al eliminar la nota del archivo: ', error);
              Swal.fire('Error', 'Ocurrió un error al eliminar la nota del archivo', 'error');
            });
          }).catch((error) => {
            console.error('Error al mover la nota a la papelera: ', error);
            Swal.fire('Error', 'Ocurrió un error al mover la nota a la papelera', 'error');
          });
        } else {
          console.log('No se encontró la nota en el archivo');
          Swal.fire('Error', 'No se encontró la nota en el archivo', 'error');
        }
      }).catch((error) => {
        console.error('Error al obtener la nota del archivo: ', error);
        Swal.fire('Error', 'Ocurrió un error al obtener la nota del archivo', 'error');
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

.bi-star{
    color: yellow;
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
  </style>
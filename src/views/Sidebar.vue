<template>
    <div class="sidebar">
        <div class="sidebar-header">
            <h1>Notas</h1>
        </div>
        <div class="letras">
            <RouterLink :to="{ name: 'home' }" class="enlace-router"
                :style="{ backgroundColor: getCurrentColor('home'), color: getCurrentFontColor('home') }">
                <i class="bi bi-journal-text" :style="{ color: getCurrentFontColor('home') }"></i>
                <span class="texto-enlace" :style="{ color: getCurrentFontColor('home') }">Notas</span>
            </RouterLink>
            <RouterLink :to="{ name: 'favoritos' }" class="enlace-router"
                :style="{ backgroundColor: getCurrentColor('favoritos'), color: getCurrentFontColor('favoritos') }">
                <i class="bi bi-star" :style="{ color: getCurrentFontColor('favoritos') }"></i>
                <span class="texto-enlace" :style="{ color: getCurrentFontColor('favoritos') }">Notas
                    Favoritas</span>
            </RouterLink>
            <RouterLink :to="{ name: 'papelera' }" class="enlace-router"
                :style="{ backgroundColor: getCurrentColor('papelera'), color: getCurrentFontColor('papelera') }">
                <i class="bi bi-trash3" :style="{ color: getCurrentFontColor('papelera') }"></i>
                <span class="texto-enlace" :style="{ color: getCurrentFontColor('papelera') }">Papelera</span>
            </RouterLink>
            <RouterLink :to="{ name: 'archivados' }" class="enlace-router"
                :style="{ backgroundColor: getCurrentColor('archivados'), color: getCurrentFontColor('archivados') }">
                <i class="bi bi-archive" :style="{ color: getCurrentFontColor('archivados') }"></i>
                <span class="texto-enlace" :style="{ color: getCurrentFontColor('archivados') }">Notas
                    Archivadas</span>
            </RouterLink>
            <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import Swal from 'sweetalert2'
import { auth } from '../main'
import { useRouter } from 'vue-router'

const getCurrentColor = (viewName: any) => {
    return router.currentRoute.value.name === viewName ? '#203562' : 'transparent';
};
const getCurrentFontColor = (viewName: string) => {
    return router.currentRoute.value.name === viewName ? '#ffffff' : '#79747e';
};
const router = useRouter();
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

</script>
<style scoped>
.sidebar {
    height: 100%;
    width: 25%;
    background-color: #e3e8f8;
    position: fixed;
    top: 0;
    left: 0;
    padding: 30px;
}

.sidebar-header {
    padding: 10px;
    color: #203562;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-style: normal;
}

.letras i {
    font-size: 1.5em;
    margin-right: 10px;
    margin-left: 10px;
    color: #79747e;
}

.letras .notas i {
    font-size: 1.25em;
    margin-right: 10px;
    margin-left: 10px;
}

.enlace-router {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    color: white;
    border-radius: 5px;
}

.texto-enlace {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-style: normal;
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
    width: 100%
}
</style>
<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <div class="login-container">
    <div>
      <img src="../assets/Img-Login.jpeg" alt="" class="app-img" />
    </div>
    <div class="login-form">
      <h1 class="Registrate">Login</h1>
      <h4 class="subtitulo">Bienvenido.</h4>
      <form @submit.prevent="submitForm">
        <input v-model="formData.email" type="email" placeholder="Email" required size="40" />
        <input
          v-model="formData.password"
          type="password"
          placeholder="Contraseña"
          required
          size="40"
        />
        <div v-if="alertMessage" class="alert">
        {{ alertMessage }} </div>
    <div class="botones">
      <button type="submit" class="login-button">Entrar</button>
    </div>
      </form>
    </div>
    <div class="Link-Register">
      <RouterLink :to="{ name: 'register'}">
        <p class="login-register">¿No tienes cuenta? Registrate</p></RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import firebase from '@/main'

let alertMessage = ref('')

interface FormData {
  email: string
  password: string
}

const formData = ref<FormData>({
  email: '',
  password: ''
})

const router = useRouter()


const submitForm = async () => {
  try {
    await firebase.auth().signInWithEmailAndPassword(formData.value.email, formData.value.password)
    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error)
    switch (error.code) {
      case 'auth/invalid-credential':
        alertMessage.value = 'El correo o la contraseña son invalidos'
        break
      case 'auth/user-disabled':
        alertMessage.value = 'El usuario ha sido deshabilitado.'
        break
      default:
        alertMessage.value = 'Ocurrió un error al iniciar sesión.'
        break
    }
  }
}
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
} 

.app-img {
  margin-bottom: 20px;
  position: relative;
  right: 200px;
  top: 200px;
  border-radius: 150px;
  width: 600px;
  height: 600px;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 350px;
  position: relative;
  left: 500px;
  top: -250px;
}

.botones {
  position: relative;
  left: 500px;
  top: -150px;
}

.Link-Register {
  position: relative;
  left: 500px;
  top: -230px;
}
.Registrate {
  position: relative;
  top: -35px;
  color: black;
  font-weight: bold;
}
.subtitulo {
  color: gray;
  position: relative;
  top: -25px;
}

.form-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.form-group input {
  width: 48%;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.login-button {
  padding: 10px;
  background-color: navy;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  top: 170px;
  left: -360px;
}

.login-register {
  margin-top: 10px;
  color: navy;
  text-decoration: underline;
  cursor: pointer;
}
@media (max-width: 800px) {
  .element {
    width: 100%;
    background-color: blue;
  }
}

@media only screen and (max-width: 600px) {
}

@media only screen and (min-width: 601px) {
}
</style>

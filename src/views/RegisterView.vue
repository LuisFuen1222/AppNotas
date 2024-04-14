<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <div class="registration-container">
    <div class="app-img">
      <img src="https://cdn-icons-png.flaticon.com/512/3771/3771133.png" alt="" />
    </div>
    <div class="registration-form">
      <h1 class="Registrate">Registrate</h1>
      <h4 class="subtitulo">Comienza a escribir tus notas</h4>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <input v-model="formData.nombre" placeholder="Nombre" required />
          <input v-model="formData.apellido" placeholder="Apellidos" required />
        </div>
        <input v-model="formData.email" type="email" placeholder="Email" required size="43" />
        <input
          v-model="formData.password"
          type="password"
          placeholder="Contraseña"
          required
          size="43"
        />
        <input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="Confirmar Contraseña"
          required
          size="43"
        />
        <div v-if="alertMessage" class="alert">
        {{ alertMessage }} </div>
        <div class="botones">
        <button type="submit" class="register-button">Registrarte</button>
      </div>
      </form>
    </div>
    <div class="Link-Register">
      <RouterLink to="/"> <p class="login-link">¿Ya tienes cuenta? Inicia sesión</p></RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import firebase from '@/main'

let alertMessage = ref('')

interface FormData {
  nombre: string
  apellido: string
  email: string
  password: string
  confirmPassword: string
}

const formData = ref<FormData>({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const submitForm = async () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    alertMessage.value = 'Las contraseñas no coinciden'
    return
  }
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(formData.value.email, formData.value.password)
    const user = userCredential.user
    alertMessage.value = 'Usuario registrado con éxito!'
    console.log('Usuario registrado con éxito:', user)
  } catch (error) {
    if ((error as any).code === 'auth/email-already-in-use') {
      alertMessage.value = 'El correo electrónico ya está registrado'
    } else {
      alertMessage.value = 'Error al registrar el usuario'
    }
    console.error('Error al registrar el usuario:', error)
  }
}
</script>

<style>
.registration-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-img {
  margin-bottom: 20px;
  position: sticky;
  right: 200px;
  top: 200px;
}

.registration-form {
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
  top: 450px;
}

.Link-Register {
  position: relative;
  left: 490px;
  top: -150px;
}
.Registrate {
  position: relative;
  top: -95px;
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

.register-button {
  padding: 10px;
  background-color: navy;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  top: 170px;
  position: relative;
  left: -350px;
}

.login-link {
  margin-top: 10px;
  color: navy;
  text-decoration: underline;
  cursor: pointer;
  top: -90px;
  position: relative;
  left: 0px;
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


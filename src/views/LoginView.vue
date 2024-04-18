<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-form">
        <h1 class="nombre">App de Notas</h1>
        <h2 class="titulo">Login</h2>
        <h4 class="subtitulo">Bienvenido.</h4>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <input v-model="formData.email" type="email" placeholder="Email" required  />
            <input v-model="formData.password" type="password" placeholder="Contraseña" required  />
          </div>
          <div v-if="alertMessage" class="alert">
            {{ alertMessage }}
          </div>
            <button type="submit" class="login-button">Entrar</button>
            <router-link :to="{ name: 'register'}" class="login-register">¿No tienes cuenta? Regístrate</router-link>
        </form>
      </div>
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
        alertMessage.value = 'El correo o la contraseña son inválidos'
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

<style scoped>
/* Estilos generales */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  margin: 0; 
  padding: 0; 
  width: 100vw; 
  height: 100vh; 
  background-image: url('../assets/background.jpg'); 
  background-size: cover; 
  background-position: center; 
}


.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
}

.login-content h1{
  text-align: center;
}

.login-form {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  background-color: #e3e8f8;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
  font-style: normal;
}

.nombre{
  margin-bottom: 30px;
  color: #203562;
  font-size: 30px;
  font-weight: bold;
}

.titulo {
  margin-bottom: 10px;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.subtitulo {
  margin-bottom: 5px;
  color: #666;
  font-size: 17px;
}

.form-group {
  margin-bottom: 20px;
  flex-direction: column;
  
}

.form-group input{
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
}

.alert {
  margin-bottom: 20px;
  color: red;
}

.login-button {
  padding: 10px 20px;
  background-color: #203562;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-register {
  margin-left: 157px;
  color: navy;
  text-decoration: underline;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-style: normal;
  font-size: .90em;
}


@media (max-width: 768px) {
  .login-form {
    max-width: 300px;
  }

  .login-register {
    margin-left: 0; 
    margin-top: 10px; 
    text-align: center; 
  }
}
</style>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <div class="registartion-container">
    <div class="login-content">
      <div class="registration-form">
        <h1 class="Registrate">Registrate</h1>
        <h4 class="subtitulo">Comienza a escribir tus notas</h4>
        <form @submit.prevent="submitForm">
          <div class="form-nombre">
            <input v-model="formData.nombre" placeholder="Nombre" required />
            <input v-model="formData.apellido" placeholder="Apellidos" required />
          </div>
          <div class="form-datos">
            <input v-model="formData.email" type="email" placeholder="Email" required />
            <input v-model="formData.password" type="password" placeholder="Contraseña" required />
            <input v-model="formData.confirmPassword" type="password" placeholder="Confirmar Contraseña" required />
          </div>
          <div v-if="alertMessage" class="alert">
            {{ alertMessage }}
          </div>
            <button type="submit" class="register-button">Registrarte</button>
            <router-link :to="{ name: 'login'}" class="register-link">¿Ya tienes cuenta? Inicia sesión</router-link>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import firebase from '@/main'
import { RouterLink } from 'vue-router';

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
  } catch (error: any) {
    console.error('Error al registrarse:', error)
    switch (error.code) {
      case 'auth/email-already-in-use':
        alertMessage.value = 'El correo electrónico ya está registrado'
        break
      case 'auth/weak-password':
        alertMessage.value = 'La contraseña debe contener al menos 6 caracteres'
        break
      case 'auth/invalid-email':
        alertMessage.value = 'No se ingreso un correo electronico valido'
        break
      default:
        alertMessage.value = 'Ocurrió un error al registrarse.'
        break
    }
  }

}
</script>

<style scoped>
/* Estilos generales */
.registartion-container {
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

.registration-form {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  background-color: #e3e8f8;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
  font-style: normal;
}

.Registrate {
  margin-bottom: 10px;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.subtitulo {
  margin-bottom: 20px;
  color: #666;
  font-size: 17px;
}

.form-nombre {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.form-nombre input {
  width: 48%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  
}

.form-datos {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.form-datos input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
}


.alert {
  margin-bottom: 20px;
  color: red;
}

.register-button {
  padding: 10px 20px;
  background-color: #203562;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}


.register-link {
  margin-left: 102px;
  color: navy;
  text-decoration: underline;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-style: normal;
  font-size: .90em;
}

@media (max-width: 768px) {
  .registration-form {
    max-width: 300px;
  }

  .register-button {
    margin-left: auto;
    margin-right: auto;
  }

  .register-link {
    text-align: center;
  }
}
</style>

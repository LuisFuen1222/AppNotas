import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDUMWStPVDS9b5RxqCcHeC0fkpWmYgiscA",
    authDomain: "appnotas-ccf47.firebaseapp.com",
    projectId: "appnotas-ccf47",
    storageBucket: "appnotas-ccf47.appspot.com",
    messagingSenderId: "1060590747909",
    appId: "1:1060590747909:web:deb8c617fb576fbf3d376c",
    measurementId: "G-X9SKC064H8"
};

firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = firebase.firestore();
export const auth = firebase.auth();

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.mount('#app')

export default firebase;

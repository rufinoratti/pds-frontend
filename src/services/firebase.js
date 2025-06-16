// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDI6yvixRcAA2K4ag7I4yGBnfyW2-rBqpg",
  authDomain: "zona-depor.firebaseapp.com",
  projectId: "zona-depor",
  storageBucket: "zona-depor.firebasestorage.app",
  messagingSenderId: "810385226609",
  appId: "1:810385226609:web:5acdae20bcecdce00f54d0",
  measurementId: "G-Z0RCDG5911"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar messaging solo si está soportado
let messaging = null;

const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      console.log('Firebase Messaging no está soportado en este navegador');
      return null;
    }
  } catch (error) {
    console.error('Error inicializando Firebase Messaging:', error);
    return null;
  }
};

/**
 * Requests permission for notifications and gets the FCM token
 * @returns {Promise<string|null>} Firebase messaging token or null if permission denied
 */
export const requestFirebaseToken = async () => {
  try {
    console.log('🔥 Iniciando proceso de Firebase token...');
    
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('❌ Este navegador no soporta notificaciones');
      return null;
    }

    // Verificar permisos de notificación
    let permission = Notification.permission;
    console.log('📱 Permiso actual de notificaciones:', permission);
    
    if (permission === 'default') {
      console.log('📱 Solicitando permisos de notificación...');
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      console.log('❌ Permisos de notificación denegados:', permission);
      return null;
    }

    console.log('✅ Permisos de notificación concedidos');

    // Inicializar messaging
    console.log('🔥 Inicializando Firebase Messaging...');
    await initializeMessaging();
    
    if (!messaging) {
      console.log('❌ Firebase Messaging no está disponible');
      return null;
    }

    console.log('✅ Firebase Messaging inicializado correctamente');

    // CLAVE VAPID
    const vapidKey = "BB16UkZs2JsOBSuAo0E2fohgQpbpQROchO_hQ8opMjHU6A7CWTJWb5JwXjZAbVTll0CUyy9k9vYNK0CgIEQj7Tc";
    
    // Verificar Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker no está soportado');
      return null;
    }

    console.log('🔧 Registrando Service Worker...');
    let registration;
    
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registrado exitosamente:', registration);
    } catch (swError) {
      console.error('❌ Error registrando Service Worker:', swError);
      // Intentar sin Service Worker registration
      registration = null;
    }
    
    console.log('🎫 Obteniendo token de Firebase...');
    
    // Configuración para getToken
    const tokenConfig = {
      vapidKey: vapidKey
    };
    
    // Solo agregar serviceWorkerRegistration si existe
    if (registration) {
      tokenConfig.serviceWorkerRegistration = registration;
    }
    
    const token = await getToken(messaging, tokenConfig);
    
    if (token) {
      console.log('✅ Token de Firebase obtenido exitosamente');
      console.log('🎫 Token:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ No se pudo obtener el token de Firebase');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo token de Firebase:', error);
    
    // Log más detallado del error
    if (error.code) {
      console.error('📋 Código de error:', error.code);
    }
    if (error.message) {
      console.error('📋 Mensaje de error:', error.message);
    }
    
    // Retornar null en lugar de lanzar el error para no bloquear el login
    return null;
  }
};

/**
 * Set up message listener for foreground messages
 * @param {Function} callback - Function to handle incoming messages
 */
export const setupMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    if (callback) {
      callback(payload);
    }
  });
};

export { app, analytics, messaging };

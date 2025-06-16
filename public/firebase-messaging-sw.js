// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI6yvixRcAA2K4ag7I4yGBnfyW2-rBqpg",
  authDomain: "zona-depor.firebaseapp.com",
  projectId: "zona-depor",
  storageBucket: "zona-depor.firebasestorage.app",
  messagingSenderId: "810385226609",
  appId: "1:810385226609:web:5acdae20bcecdce00f54d0",
  measurementId: "G-Z0RCDG5911"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'Zona Depor';
  const notificationOptions = {
    body: payload.notification.body || 'Tienes una nueva notificación',
    icon: '/favicon.ico', // Cambia por tu icono
    badge: '/favicon.ico',
    tag: 'zona-depor-notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Handle click action
  event.waitUntil(
    clients.openWindow('http://localhost:5173') // Cambia por tu URL de producción
  );
});

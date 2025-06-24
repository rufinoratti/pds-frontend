# pds-frontend

Frontend de la aplicación PDS, desarrollado con React y Vite. Este proyecto gestiona la interfaz de usuario para la plataforma, incluyendo autenticación, gestión de partidos, perfiles de usuario y notificaciones.

---

## Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Configuración de Firebase](#configuración-de-firebase)
- [Scripts Disponibles](#scripts-disponibles)
- [Uso](#uso)
- [Dependencias Principales](#dependencias-principales)
- [Notas y Recomendaciones](#notas-y-recomendaciones)

---

## Características

- Autenticación de usuarios (Firebase)
- Gestión de partidos (crear, editar, buscar, ver detalles)
- Perfil de usuario
- Notificaciones tipo toast
- Notificaciones push (Firebase Messaging)
- Integración con Firebase Analytics
- UI moderna con TailwindCSS
- Manejo de estado global con Zustand
- Arquitectura modular y escalable

---

## Requisitos Previos

- Node.js >= 16.x
- npm >= 8.x
- Acceso a un proyecto de Firebase (para Analytics y Messaging)
- Git

---

## Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd pds-frontend
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno** (ver sección [Variables de Entorno](#variables-de-entorno)).

4. **Configura Firebase** (ver sección [Configuración de Firebase](#configuración-de-firebase)).

---

## Estructura del Proyecto

```
pds-frontend/
│
├── public/
│   └── firebase-messaging-sw.js   # Service Worker para notificaciones push
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── ui/                    # Componentes UI reutilizables (botón, card, toast, etc.)
│   ├── hooks/                     # Custom hooks (useMatchFilters, etc.)
│   ├── lib/                       # Utilidades generales
│   ├── pages/                     # Páginas principales (Auth, Home, Perfil, etc.)
│   ├── services/                  # Servicios (auth, firebase, matches, etc.)
│   ├── store/                     # Estado global (userStore.js con Zustand)
│   ├── index.css                  # Estilos globales
│   ├── App.jsx                    # Componente raíz
│   └── main.jsx                   # Punto de entrada de React
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables según tu configuración de Firebase:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

> **Nota:** Cambia los valores según tu configuración real.

---

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Obtén las credenciales de tu proyecto y colócalas en el archivo `.env` como se indica arriba.
3. Asegúrate de tener el archivo `firebase-messaging-sw.js` en la carpeta `public/` para las notificaciones push.
4. Instala la dependencia de Firebase:
   ```bash
   npm install firebase
   ```

---

## Scripts Disponibles

- `npm run dev`  
  Inicia el servidor de desarrollo en modo hot-reload.

- `npm run build`  
  Genera la versión de producción en la carpeta `dist`.

- `npm run preview`  
  Sirve la build de producción localmente para pruebas.

---

## Uso

1. Inicia el frontend:
   ```bash
   npm run dev
   ```
2. Accede a la aplicación en [http://localhost:5173](http://localhost:5173) (o el puerto que indique la terminal).

---

## Dependencias Principales

- **React**: Librería principal para la UI.
- **Vite**: Bundler ultrarrápido para desarrollo.
- **TailwindCSS**: Utilidades para estilos modernos.
- **Zustand**: Manejo de estado global.
- **Firebase**: Autenticación, Analytics y Mensajería.
- **PostCSS**: Procesador de CSS.

Instala las dependencias principales con:
```bash
npm install zustand firebase
```

---
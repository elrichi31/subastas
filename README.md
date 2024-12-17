# 📋 Descripción del Proyecto
El proyecto **Subastas** es una aplicación web que permite la gestión y visualización de subastas. Está compuesto por un **frontend** desarrollado con **Next.js** y un backend desarrollado con **Node.js** utilizando **Express** y **Socket.IO**.

# 📂 Estructura del Proyecto
El repositorio contiene dos carpetas principales:

1. **subastas_backend**: Contiene la lógica del servidor y servicios REST API.
2. **subastas_frontend**: Contiene el código del cliente desarrollado en **Next.js**.


# 🚀 Configuración y Ejecución

## 1️⃣ Requisitos previos##

* Node.js (versión >= 14)
* npm o yarn

## 2️⃣ Instalación y Ejecución del Backend
Ejecutar los siguientes comandos en una terminal (para esto tener el .zip del proyecto ya descomprimido):

```
# Navegar a la carpeta del backend
cd subastas_backend

# Instalar dependencias
npm install

# Iniciar el servidor
node server.js
```
El servidor estará corriendo en http://localhost:3001 o en el puerto configurado.

## 3️⃣ Instalación y Ejecución del Frontend
Abrir otra terminal y ejecuta lo siguiente:

```
# Navegar a la carpeta del frontend
cd subastas_frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en http://localhost:3000.

# 🔑 Acceso y Autenticación
Primero, acceder al registro en:
👉 http://localhost:3000/register

Desde aquí se puede registrar como postor (solo nombre y apellido) o acceder como moderador.

Para acceder como moderador, usar las siguientes credenciales:

* **Usuario**: admin
* **Contraseña**: admin

Una vez autenticado, se puede ingresar al sistema y gestionar las subastas.

# 🔄 Resumen de Ejecución

* Primero, ejecutar el backend en una terminal.
* Segundo, ejecutar el frontend en otra terminal.
* Acceder a http://localhost:3000/register para registrarse o iniciar sesión (caso moderador).

# 🛠️ Tecnologías Utilizadas

- Backend: Node.js, Express, Socket.IO
- Frontend: Next.js, TailwindCSS

# 📜 Estructura de Archivos

* Backend: subastas_backend/
```
- data/          # Datos para las subastas
- routes/        # Endpoints REST
- services/      # Lógica de negocio
- websocket/     # Configuración de WebSocket
- server.js      # Archivo principal del servidor
- createAuctions.js  # Lógica para crear subastas desde JSON
- package.json   # Dependencias y scripts
```
* Frontend: subastas_frontend/
```
- public/        # Archivos estáticos
- src/
  - components/  # Componentes del UI
  - pages/       # Páginas del frontend
- package.json   # Dependencias y scripts
- README.md      # Documentación
- next.config.ts # Configuración de Next.js
- tailwind.config.ts # Configuración de TailwindCSS
```
# 🧪 Reminder de Testing
- Ejecutar el backend primero (node server.js).
- Ejecutar el frontend (npm run dev).
- Acceder a http://localhost:3000/register para iniciar sesión o registrarse.
- Usar credenciales de moderador (usuario: admin, contraseña: admin) si se requiere.

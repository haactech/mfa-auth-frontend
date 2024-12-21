# 🔐 Frontend de Autenticación con MFA

¡Que tal! Este es el frontend de nuestro sistema de autenticación, hecho con React + TypeScript y con todo el cariño del mundo para hacer un login bien seguro y pasar la prueba de creze 🚀

## ✨ Características

- Login con JWT bien pro
- Soporte para Google Authenticator y otros TOTP
- UI super friendly para configurar MFA
- Códigos QR bien bonitos para configurar tu autenticador
- TypeScript porque somos desarrolladores serios (a veces)
- Responsive design 

## 🛠️ Pre-requisitos

- Node.js 18 o más nuevo
- npm o yarn (lo que más te guste)
- Un explorador web moderno (no IE, por favor 😅)
- El backend corriendo (si no lo tienes, ¡revisa el otro README!)

## 🚀 Instalación y Uso Local

1. Clona el repo
```bash
git clone <url-del-repo>
cd <carpeta-del-frontend>
```

2. Instala las dependencias
```bash
# Con npm
npm install

# O si eres team yarn
yarn
```

3. Configura las variables de entorno
```bash
# Copia el ejemplo
cp .env.example .env

# Edita .env con tu config
VITE_API_URL=http://localhost:8000/api
VITE_MFA_ISSUER=TuAppChida
```

4. ¡A darle!
```bash
# Modo desarrollo
npm run dev
# o
yarn dev
```

Tu app debería estar corriendo en `http://localhost:5173` 🎉

## 🏗️ Scripts Disponibles

```bash
# Desarrollo
npm run dev       # Inicia el servidor de desarrollo

# Producción
npm run build     # Construye la app para producción
npm run preview   # Preview local de la build

# Otros
npm run lint      # Revisa el código con ESLint
npm run format    # Formatea el código con Prettier
```

## 📁 Estructura del Proyecto

```
src/
  ├── components/     # Componentes reusables
  ├── pages/         # Páginas principales
  ├── services/      # Servicios de API
  ├── types/         # TypeScript types/interfaces
  └── App.tsx        # Componente principal
```

## 🔌 Conectando con el Backend

El frontend espera que el backend esté corriendo en http://localhost:8000. Si lo tienes en otro lado, actualiza VITE_API_URL en tu .env.

## 🎨 Customización

- Los estilos principales están en `src/styles/`

## 🐛 Problemas Comunes

- Si ves errores de CORS, revisa que el backend esté corriendo y configurado correctamente
- Si el login no funciona, checa la consola del navegador por errores
- Si el QR no escanea, asegúrate que tu cámara tenga permisos
- "¡No me carga nada!" → ¿Revisaste que el backend esté arriba? 😅

## ⚡ Tips Pro

- Usa la extensión React Developer Tools
- Chrome/Firefox tienen herramientas para simular diferentes dispositivos
- Los tokens JWT se guardan en localStorage (por ahora)
- F12 es tu mejor amigo para debuggear

## 🚀 Despliegue

Ya está deployado en AWS s3 con ayuda de cloudfron:
- URL: https://app.hermesagc.com/
- Branch: main


## 📝 Por Hacer

- [x] Implementar recuperación de contraseña
- [x] Mejorar animaciones
- [x] Hacer más tests 

## 🤝 Contribuir

¿Encontraste un bug? ¿Quieres agregar algo cool? ¡Abre un PR! Solo asegúrate de:

1. Formatear tu código (npm run format)
2. No romper nada (porfa)
3. Agregar buenos commits (nada de "arreglado" 😅)

## 🎯 Estado Actual

- Build: ✅ Passing
- Tests: 🟡 Algunos pasan
- Producción: ✅ Corriendo
- Último deploy: 20/12/2024

## 🤔 Ayuda

Si algo no funciona:
1. Respira profundo
2. Cuenta hasta 10
3. Revisa la consola
4. Abre un issue
# Acceso privado del diario

El diario usa Vercel Routing Middleware para proteger todas las rutas y archivos estáticos.

Variables de entorno requeridas en Vercel:
- `DIARY_PASSWORD`: clave compartida del diario.
- `DIARY_SESSION_SECRET`: secreto de firma de las sesiones.

La contraseña y el secreto se guardan únicamente como variables sensibles de Vercel; no deben añadirse al repositorio.

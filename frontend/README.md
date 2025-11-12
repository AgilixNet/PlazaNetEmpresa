# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Admin Software – Gestión de Usuarios

Ruta: `/admin-software/usuarios`

- Ver todos los usuarios (tabla con nombre, correo, rol, plaza y fecha de creación)
- Filtrar por plaza (usa los valores definidos en `src/utils/constants.js` → `PLAZAS`)
- Buscar por nombre, correo o rol
- Cambiar rol directamente desde la tabla
- Restablecer contraseña: envía un correo de recuperación usando Supabase Auth

Notas:
- El restablecimiento de contraseña envía un email al usuario (no cambia la contraseña directamente). Requiere que el perfil tenga `correo`/`email`.
- El campo "Plaza" se obtiene de `perfil.plaza | perfil.plazaNombre | perfil.nombrePlaza | perfil.plaza_id`. Si no existe, se muestra "Sin plaza".

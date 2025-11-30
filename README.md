# Uploadify

Herramienta simple para exportar datos de una cuenta de Spotify (playlists, me gusta, álbumes, artistas seguidos y podcasts) y volver a importarlos en otra cuenta usando la API oficial de Spotify.

## Requisitos
- Node.js 18+ (si usas Vercel, el runtime ya viene incluido).
- Credenciales de Spotify Developer (app en el dashboard).

## Variables de entorno
Configura en tu entorno (o en Vercel):
- `SP_CLIENT_ID`
- `SP_CLIENT_SECRET`
- `SP_REDIRECT_URI` (https, debe coincidir con lo configurado en la app de Spotify)

## Uso local
1) Instala dependencias: `npm install`
2) Crea un `.env.local` o exporta las variables de entorno anteriores.
3) Arranca con `npm run dev` (si usas Vercel CLI) o `npm start` según tu setup.

## Despliegue
- Incluye `/public` como estático y `/api/*.js` como funciones serverless (ver `vercel.json`).
- Asegura que las Redirect URIs en Spotify apunten a tu dominio https final.

## Datos y privacidad
- No se guardan respaldos en servidores: los archivos se generan en el navegador y se descargan localmente.
- Los tokens se mantienen en cookies de sesión para llamar a la API de Spotify; al cerrar sesión o borrar cookies, se invalidan.
- Las páginas `/privacy.html` y `/terms.html` describen el uso y manejo de datos.

## Contacto
Soporte: uploadify01@gmail.com

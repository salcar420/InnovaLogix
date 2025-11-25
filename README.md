# InnovaLogix - Sistema de Gestión de Inventario y Compras

Este proyecto es una aplicación web para la gestión de inventario, compras y proveedores.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

*   **Node.js** (versión 16 o superior)
*   **PostgreSQL** (Base de datos)
*   **Git**

## Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/salcar420/InnovaLogix.git
    cd InnovaLogix
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

## Configuración de la Base de Datos

1.  Asegúrate de que el servicio de PostgreSQL esté ejecutándose.
2.  Crea una base de datos llamada `ads_db` (o el nombre que prefieras, pero asegúrate de actualizar el `.env`).

    ```sql
    CREATE DATABASE ads_db;
    ```

## Configuración de Variables de Entorno

El proyecto necesita un archivo `.env` en la raíz para conectarse a la base de datos. Este archivo no se incluye en el repositorio por seguridad.

1.  Crea un archivo llamado `.env` en la carpeta raíz del proyecto.
2.  Copia y pega el siguiente contenido, ajustando los valores según tu configuración local de PostgreSQL:

    ```env
    # Configuración de Base de Datos PostgreSQL
    DB_USER=postgres
    DB_HOST=localhost
    DB_NAME=ads_db
    DB_PASSWORD=tu_contraseña_aqui
    DB_PORT=5432
    ```

    *Nota: Si tu PostgreSQL corre en otro puerto (ej. 5433), asegúrate de cambiarlo aquí.*

## Ejecución

Para iniciar tanto el servidor backend como la aplicación frontend en modo desarrollo, ejecuta:

```bash
npm run dev:full
```

*   El **Frontend** estará disponible en: `http://localhost:5173`
*   El **Backend** se ejecutará en: `http://localhost:3001`

## Scripts Disponibles

*   `npm run dev`: Inicia solo el frontend (Vite).
*   `npm run server`: Inicia solo el servidor backend.
*   `npm run dev:full`: Inicia ambos concurrentemente.
*   `npm run build`: Construye la aplicación para producción.

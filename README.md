# Monotickets

Monotickets es un monorepo que contiene la API de Monotickets, la aplicación web PWA y los paquetes compartidos utilizados por ambos servicios.

## Requisitos previos

- [PNPM](https://pnpm.io/) 8+
- Docker y Docker Compose v2
- Node.js 20+

## Primeros pasos

1. Duplica los archivos `.env.example` de `apps/api` y `apps/web` en el mismo directorio como `.env` y ajusta los valores según tu entorno local.
2. Instala las dependencias compartidas ejecutando `pnpm install` en la raíz del repositorio.
3. Levanta la infraestructura con Docker Compose: `docker compose -f infra/docker-compose.yml up -d`.
4. Cuando todos los contenedores estén saludables, accede a la API en [http://localhost:3000](http://localhost:3000) y a la web en [http://localhost:5173](http://localhost:5173).
5. Ejecuta `pnpm -w run typecheck` para validar los tipos de todos los paquetes.

## Scripts útiles

- `pnpm -r test`: ejecuta los tests de todas las aplicaciones.
- `pnpm -r lint`: ejecuta los linters configurados.
- `pnpm -r typecheck`: asegura que los proyectos compilen sus tipos.

## Resolución de problemas

- **Puertos ocupados:** asegúrate de que los puertos 3000 (API), 5173 (web), 5432 (PostgreSQL), 6379 (Redis), 9000/9001 (MinIO) y 8025 (Mailhog) estén libres. Si utilizas WSL/Windows, verifica que no haya procesos reteniendo estos puertos entre sesiones.
- **Permisos de archivos:** en sistemas Linux puede ser necesario ajustar los permisos de los volúmenes creados por Docker (`sudo chown -R $USER:$USER data/`).
- **WSL/Windows:** utiliza rutas relativas dentro del repositorio para evitar problemas con los montajes de Docker. Ejecuta los comandos desde la terminal de la distribución para asegurar compatibilidad con PNPM.

## Arquitectura

- `apps/api`: servicio NestJS que expone endpoints REST y Socket.IO y persiste datos con PostgreSQL mediante Prisma.
- `apps/web`: aplicación React + Vite + PWA con autenticación basada en tokens y caché offline en IndexedDB.
- `packages/shared`: tipos compartidos entre la API y la aplicación web.
- `infra`: definiciones de infraestructura (Docker Compose, Traefik y scripts de semillas).

## Contribución

1. Crea una rama para tus cambios.
2. Asegúrate de que `pnpm -w run typecheck` y los tests relevantes pasen.
3. Envía un Pull Request con una descripción clara de tus modificaciones.

# Aplicación de Vocabulario Japonés

Una aplicación web para aprender vocabulario japonés con sistema de práctica aleatoria y seguimiento de progreso.

## Características

- Añadir palabras en japonés con su traducción al español
- Sistema de práctica con orden basado en dificultad
- Seguimiento de palabras aprendidas y no aprendidas
- Persistencia de datos con PostgreSQL
- Interfaz en español

## Requisitos

- Node.js 18 o superior
- PostgreSQL
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` con las siguientes variables:
```
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basededatos
```

4. Iniciar la aplicación:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## Tecnologías utilizadas

- React con TypeScript
- Express.js
- PostgreSQL con Drizzle ORM
- TailwindCSS
- shadcn/ui

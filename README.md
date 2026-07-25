# SalesCoach AI

Coach de Ventas con Inteligencia Artificial para llamadas comerciales.

## Stack Tecnológico

- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, Python, PostgreSQL, Supabase
- **IA:** OpenAI Whisper (transcripción), GPT-4 (análisis)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth

## Requisitos Previos

- Node.js v20+
- Python 3.11+
- pnpm
- Cuenta de Supabase (https://supabase.com)
- API Key de OpenAI (https://platform.openai.com)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd COASHSALESIA
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Frontend:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Backend:
```bash
cp apps/api/.env.example apps/api/.env
```

### 4. Configurar Supabase

1. Crear un proyecto en Supabase
2. Ejecutar el SQL en `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase
3. Copiar las credenciales a los archivos `.env`

### 5. Ejutar en desarrollo

```bash
# Frontend
pnpm --filter web dev

# Backend
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Estructura del Proyecto

```
COASHSALESIA/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend FastAPI
├── supabase/
│   └── migrations/   # Migraciones SQL
└── packages/
    └── shared/       # Tipos compartidos
```

## Pantallas

- **Dashboard** - Resumen semanal y estadísticas
- **Llamadas** - Lista de llamadas y upload de audio
- **Análisis IA** - Score, fortalezas, errores, timeline
- **Coach IA** - Chat con asistente de ventas
- **Entrenamiento** - Roleplays y práctica
- **Perfil** - Habilidades y progreso
- **Equipo** - Dashboard del supervisor
- **Configuración** - Perfil y preferencias

## Deploy

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (Railway/Render)

```bash
# Railway
railway up
```

## Licencia

Propietario - Todos los derechos reservados

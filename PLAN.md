# SalesCoach AI - Plan de Implementación

## 📋 Resumen del Proyecto

**SalesCoach AI** es un SaaS B2B que actúa como un coach personal de ventas con IA. Analiza llamadas comerciales y proporciona recomendaciones accionables para mejorar el rendimiento de vendedores.

**Stack Tecnológico:**
- Frontend: Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Python 3.11+, PostgreSQL, Supabase
- IA: Whisper (transcripción), GPT-4 (análisis)
- Storage: Supabase Storage
- Auth: Supabase Auth

**Paleta de colores:** Verde de crecimiento (estilo premium)

---

## 🗂️ Estructura del Proyecto

```
COASHSALESIA/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # Componentes React
│   │   │   ├── lib/           # Utilidades
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── types/         # TypeScript types
│   │   │   └── styles/        # Estilos globales
│   │   └── public/            # Assets estáticos
│   │
│   └── api/                    # Backend FastAPI
│       ├── app/
│       │   ├── api/           # Rutas API
│       │   ├── core/          # Configuración core
│       │   ├── models/        # Modelos de BD
│       │   ├── services/      # Lógica de negocio
│       │   └── utils/         # Utilidades
│       ├── alembic/           # Migraciones BD
│       └── tests/             # Tests
│
├── packages/
│   └── shared/                 # Tipos compartidos
│
├── supabase/                   # Configuración Supabase
│   ├── migrations/
│   └── seed.sql
│
└── docs/                       # Documentación
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores (Verde Crecimiento)

```css
/* Primarios */
--emerald-50: #ecfdf5;
--emerald-100: #d1fae5;
--emerald-200: #a7f3d0;
--emerald-300: #6ee7b7;
--emerald-400: #34d399;
--emerald-500: #10b981;  /* Principal */
--emerald-600: #059669;
--emerald-700: #047857;
--emerald-800: #065f46;
--emerald-900: #064e3b;

/* Neutros (estilo Linear) */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
--slate-950: #020617;

/* Acentos */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Tipografía

- **Headings:** Inter (700, 600)
- **Body:** Inter (400, 500)
- **Mono:** JetBrains Mono (código, scores)

### Componentes Base

- Cards con bordes sutiles y sombras mínimas
- Botones con transiciones suaves (200ms)
- Inputs con focus ring verde
- Badges/redondeados para estados
- Animaciones de entrada fade-up

---

## 📅 Fases de Implementación

### FASE 0: Configuración del Entorno
**Duración:** 30 minutos

1. Instalar Node.js (v20+)
2. Instalar Python (3.11+)
3. Instalar pnpm
4. Configurar Docker (para PostgreSQL local)
5. Crear cuentas:
   - Supabase (https://supabase.com)
   - OpenAI (https://platform.openai.com)

### FASE 1: Arquitectura del Proyecto
**Duración:** 2-3 horas

1. Inicializar monorepo con Turborepo
2. Configurar Next.js con App Router
3. Configurar FastAPI
4. Configurar PostgreSQL con Docker
5. Configurar Supabase
6. Establecer tipados compartidos

### FASE 2: Sistema de Diseño y Componentes
**Duración:** 4-5 horas

1. Configurar Tailwind CSS
2. Instalar shadcn/ui
3. Crear sistema de diseño
4. Desarrollar componentes base:
   - Button, Input, Card, Badge
   - Sidebar, Header
   - Modal, Toast
   - ScoreCircle, ProgressRing
5. Crear layout principal

### FASE 3: Autenticación
**Duración:** 2-3 horas

1. Configurar Supabase Auth
2. Login/Registro pages
3. Protected routes
4. User context
5. Session management

### FASE 4: Backend API
**Duración:** 5-6 horas

1. Modelos de base de datos:
   - users
   - calls
   - analyses
   - skills
   - recommendations
   - teams

2. Endpoints principales:
   - POST /api/calls/upload
   - GET /api/calls
   - GET /api/analyses/{id}
   - GET /api/dashboard/stats
   - GET /api/skills/profile

3. Servicios:
   - AudioService (upload, process)
   - TranscriptionService (Whisper)
   - AnalysisService (GPT-4)
   - ScoreService (cálculos)

### FASE 5: Frontend - Pantallas Principales
**Duración:** 6-8 horas

#### 5.1 Dashboard
- WelcomeCard con avatar y saludo
- WeeklyGoal con progress ring
- StatsGrid (llamadas, calidad, tendencia)
- RecentCalls lista
- AnalizarCall button CTA

#### 5.2 Subir Llamada
- Drag & drop upload
- Progress bar de procesamiento
- Estados: Subiendo → Transcribiendo → Analizando → Completo

#### 5.3 Análisis de Llamada
- ScoreCard principal (0-100)
- ProbabilityBadge (% cierre)
- SummaryCard
- StrengthsList (verde)
- ErrorsList (rojo)
- ObjectionsList (amarillo)
- TechniquesUsed
- RecommendationsList
- NextSteps
- Timeline interactiva
- Transcripción sincronizada

#### 5.4 Coach IA
- Chat interface
- Contexto de llamada seleccionada
- Sugerencias rápidas
- Historial de conversación

#### 5.5 Entrenamiento
- Roleplay cards
- Dificultad levels
- Simulador de llamada
- Feedback en tiempo real

#### 5.6 Perfil del Vendedor
- Radar chart de habilidades
- Skill cards con scores
- Evolución temporal
- Logros/desbloqueos

#### 5.7 Equipo (Supervisor)
- Ranking table
- Team stats
- Alertas
- Evolución del equipo

### FASE 6: Integración con IA
**Duración:** 4-5 horas

1. Whisper integration:
   - Upload audio → transcripción
   - Speaker diarization

2. GPT-4 analysis:
   - Sentiment analysis
   - Objection detection
   - Technique identification
   - Score calculation
   - Recommendation generation

3. Coach chat:
   - Context-aware responses
   - Practice mode

### FASE 7: Dashboard Supervisor
**Duración:** 3-4 horas

1. Team overview
2. Rankings
3. Common errors
4. Frequent objections
5. Team evolution
6. Training needs alerts

### FASE 8: Optimizaciones
**Duración:** 2-3 horas

1. Performance optimization
2. Loading states
3. Error handling
4. Responsive design
5. Accessibility

### FASE 9: Deployment
**Duración:** 2-3 horas

1. Vercel (Frontend)
2. Railway/Render (Backend)
3. Supabase (Database + Auth + Storage)
4. Environment variables
5. CI/CD básico

---

## 🗃️ Schema de Base de Datos

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'seller', -- seller, supervisor, admin
  avatar_url TEXT,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipos
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Llamadas
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT,
  client_name TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análisis
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) UNIQUE NOT NULL,
  transcription TEXT,
  summary TEXT,
  overall_score INTEGER, -- 0-100
  closing_probability INTEGER, -- 0-100
  strengths JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  techniques_used JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilidades del vendedor
CREATE TABLE seller_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  skill_name TEXT NOT NULL,
  score INTEGER DEFAULT 0, -- 0-100
  explanation TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- Objetivos semanales
CREATE TABLE weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  calls_target INTEGER DEFAULT 20,
  calls_completed INTEGER DEFAULT 0,
  quality_target INTEGER DEFAULT 75,
  quality_average DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);
```

---

## 📊 Endpoints API

### Calls
```
POST   /api/v1/calls/upload      # Subir audio
GET    /api/v1/calls              # Listar llamadas
GET    /api/v1/calls/{id}         # Detalle llamada
DELETE /api/v1/calls/{id}         # Eliminar llamada
```

### Analyses
```
GET    /api/v1/analyses/{call_id}  # Obtener análisis
POST   /api/v1/analyses/{call_id}/reanalyze  # Re-analizar
```

### Dashboard
```
GET    /api/v1/dashboard/stats     # Estadísticas seller
GET    /api/v1/dashboard/goal      # Objetivo semanal
GET    /api/v1/dashboard/trend     # Tendencia semanal
```

### Skills
```
GET    /api/v1/skills              # Habilidades del seller
GET    /api/v1/skills/radar        # Datos para radar chart
GET    /api/v1/skills/history      # Evolución temporal
```

### Coach
```
POST   /api/v1/coach/chat          # Chat con coach
POST   /api/v1/coach/practice      # Iniciar práctica
```

### Team (Supervisor)
```
GET    /api/v1/team/ranking        # Ranking vendedores
GET    /api/v1/team/stats          # Estadísticas equipo
GET    /api/v1/team/alerts         # Alertas
GET    /api/v1/team/evolution      # Evolución equipo
```

---

## 🎯 Criterios de Aceptación

### Calidad Visual
- [ ] Diseño consistente en todas las pantallas
- [ ] Animaciones suaves (200-300ms)
- [ ] Responsive en tablet y desktop
- [ ] Modo oscuro opcional
- [ ] Empty states ilustrados
- [ ] Loading states elegantes

### Funcionalidad
- [ ] Upload de audio funciona correctamente
- [ ] Transcripción precisa con Whisper
- [ ] Análisis completo con GPT-4
- [ ] Scores calculados correctamente
- [ ] Timeline sincronizada con audio
- [ ] Coach IA responde contextualmente

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] API responses < 500ms (excepto IA)
- [ ] Audio upload con progress

### UX
- [ ] Flujo intuitivo sin training
- [ ] Feedback visual en cada acción
- [ ] Error messages claros
- [ ] Undo/confirm en acciones destructivas
- [ ] Keyboard shortcuts

---

## 🔧 Comandos de Desarrollo

```bash
# Instalación
pnpm install
docker-compose up -d

# Desarrollo
pnpm dev                    # Todos los apps
pnpm --filter web dev       # Solo frontend
pnpm --filter api dev       # Solo backend

# Build
pnpm build

# Database
pnpm db:migrate
pnpm db:seed
```

---

## 📝 Notas de Implementación

### Decisiones de Diseño
1. **App Router** para mejor SEO y layouts anidados
2. **Server Components** para performance
3. **shadcn/ui** para componentes accesibles y customizables
4. **Tailwind** para estilos consistentes
5. **Zustand** para estado global ligero

### Prioridades
1. **P0:** Auth, Upload, Análisis básico, Dashboard
2. **P1:** Coach IA, Perfil vendedor, Timeline
3. **P2:** Entrenamiento, Dashboard supervisor
4. **P3:** Modo oscuro, Animaciones avanzadas

---

**Última actualización:** Plan inicial creado
**Estado:** Pendiente aprobación del usuario

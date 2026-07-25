import type {
  User,
  Call,
  Analysis,
  SellerSkill,
  WeeklyGoal,
  DashboardStats,
  TeamRanking,
} from "@/types";

export const mockUser: User = {
  id: "1",
  email: "carlos@empresa.com",
  full_name: "Carlos Mendoza",
  role: "seller",
  avatar_url: undefined,
  team_id: "team-1",
  created_at: "2024-01-15T10:00:00Z",
};

export const mockWeeklyGoal: WeeklyGoal = {
  id: "goal-1",
  user_id: "1",
  week_number: 29,
  year: 2024,
  calls_target: 25,
  calls_completed: 18,
  quality_target: 80,
  quality_average: 76,
};

export const mockTimeline = [
  { id: "1", type: "start" as const, label: "Inicio", timestamp_seconds: 0, is_highlight: false },
  { id: "2", type: "rapport" as const, label: "Rapport", timestamp_seconds: 45, description: "Conexión personal con el cliente", is_highlight: false },
  { id: "3", type: "interest" as const, label: "Interés", timestamp_seconds: 180, description: "Cliente muestra interés en el producto", is_highlight: true },
  { id: "4", type: "objection" as const, label: "Objeción: Precio", timestamp_seconds: 320, description: "Cliente cuestiona el precio del servicio", is_highlight: true },
  { id: "5", type: "error" as const, label: "Error: Interrupción", timestamp_seconds: 420, description: "Vendedor interrumpió al cliente 3 veces", is_highlight: true },
  { id: "6", type: "closing" as const, label: "Intento de Cierre", timestamp_seconds: 540, description: "Vendedor intentó cerrar la venta", is_highlight: true },
  { id: "7", type: "end" as const, label: "Fin", timestamp_seconds: 600, is_highlight: false },
];

export const mockAnalysis: Analysis = {
  id: "analysis-1",
  call_id: "call-1",
  transcription: `VENDEDOR: ¡Hola! Buenos días, ¿con quién tengo el gusto de hablar?

CLIENTE: Hola, soy Juan García, gerente de operaciones de TechCorp.

VENDEDOR: ¡Hola Juan! Mucho gusto, soy Carlos de SalesCoach Solutions. ¿Cómo estás hoy?

CLIENTE: Bien, bien. Me dijeron que tenías una propuesta interesante para nosotros.

VENDEDOR: Así es, Juan. Trabajamos con empresas como la tuya para optimizar sus procesos de venta. ¿Podrías contarme un poco sobre cómo manejan actualmente sus ventas?

CLIENTE: Pues la verdad es que tenemos problemas con la conversión. Nuestro equipo cierra solo el 20% de las oportunidades.

VENDEDOR: Entiendo. Eso es común. Nuestra solución puede aumentar eso hasta un 45%. El costo es de $5,000 mensuales.

CLIENTE: $5,000 es bastante. ¿No hay algo más económico?

VENDEDOR: Bueno, es una inversión que se paga sola en el primer mes...

CLIENTE: Ya, pero necesito pensarlo.

VENDEDOR: Claro, tómate tu tiempo. ¿Te parece si agendamos una llamada la próxima semana?

CLIENTE: Sí, está bien.`,
  summary:
    "El vendedor estableció un buen rapport inicial pero falló en profundizar en las necesidades del cliente. La presentación del precio fue abrupta sin valor percibido previo. El manejo de la objeción de precio fue débil, ofreciendo un descuento sin alternativas. La llamada terminó sin un cierre efectivo.",
  overall_score: 58,
  closing_probability: 35,
  strengths: [
    "Saludo profesional y cálido",
    "Identificó correctamente al tomador de decisiones",
    "Pregunta abierta para descubrir necesidades",
    "Mantuvo tono amable durante toda la llamada",
  ],
  errors: [
    "Presentó el precio antes de construir valor percibido",
    "No profundizó en el problema específico del cliente",
    "Interrumpió al cliente en 3 ocasiones",
    "No manejó la objeción de precio con técnicas adecuadas",
    "Cerró la llamada sin un compromiso claro",
    "No ofreció casos de éxito o prueba social",
  ],
  objections: [
    {
      text: "$5,000 es bastante. ¿No hay algo más económico?",
      response: "Bueno, es una inversión que se paga sola en el primer mes...",
      handled_well: false,
    },
    {
      text: "Ya, pero necesito pensarlo.",
      response: "Claro, tómate tu tiempo. ¿Te parece si agendamos una llamada la próxima semana?",
      handled_well: true,
    },
  ],
  techniques_used: [
    "Preguntas abiertas",
    "Identificación de pain points",
    "Presentación de solución",
  ],
  recommendations: [
    "Usa la técnica SPIN Selling para profundizar antes de presentar precio",
    "Construye valor percibido con casos de éxito antes de mencionar precio",
    "Practica el manejo de objeciones con el método Feel-Felt-Found",
    "Implementa pausas de 3 segundos después de que el cliente termine de hablar",
    "Cierra con una pregunta específica: '¿Te parece que implementemos la fase piloto este mes?'",
  ],
  next_steps: [
    "Practicar manejo de objeción de precio",
    "Revisar técnica de construcción de valor",
    "Agendar roleplay con coach IA sobre cierre de ventas",
    "Completar módulo de escucha activa",
  ],
  timeline: mockTimeline,
  created_at: "2024-07-15T14:30:00Z",
};

export const mockCalls: Call[] = [
  {
    id: "call-1",
    user_id: "1",
    title: "Llamada con TechCorp",
    client_name: "Juan García",
    duration_seconds: 600,
    status: "completed",
    created_at: "2024-07-15T14:30:00Z",
    analysis: mockAnalysis,
  },
  {
    id: "call-2",
    user_id: "1",
    title: "Seguimiento - InnovaSoft",
    client_name: "María López",
    duration_seconds: 420,
    status: "completed",
    created_at: "2024-07-14T10:15:00Z",
    analysis: {
      ...mockAnalysis,
      id: "analysis-2",
      call_id: "call-2",
      overall_score: 82,
      closing_probability: 68,
    },
  },
  {
    id: "call-3",
    user_id: "1",
    title: "Prospección - DataFlow",
    client_name: "Roberto Sánchez",
    duration_seconds: 350,
    status: "completed",
    created_at: "2024-07-13T16:45:00Z",
    analysis: {
      ...mockAnalysis,
      id: "analysis-3",
      call_id: "call-3",
      overall_score: 71,
      closing_probability: 45,
    },
  },
  {
    id: "call-4",
    user_id: "1",
    title: "Demo - CloudFirst",
    client_name: "Ana Martínez",
    duration_seconds: 900,
    status: "completed",
    created_at: "2024-07-12T09:00:00Z",
    analysis: {
      ...mockAnalysis,
      id: "analysis-4",
      call_id: "call-4",
      overall_score: 91,
      closing_probability: 85,
    },
  },
  {
    id: "call-5",
    user_id: "1",
    title: "Reunión - GlobalTech",
    client_name: "Pedro Ruiz",
    duration_seconds: 480,
    status: "processing",
    created_at: "2024-07-11T11:30:00Z",
  },
];

export const mockDashboardStats: DashboardStats = {
  calls_today: 3,
  calls_this_week: 18,
  average_score: 76,
  score_trend: 8,
  weekly_goal: mockWeeklyGoal,
  recent_calls: mockCalls,
};

export const mockSkills: SellerSkill[] = [
  {
    id: "skill-1",
    user_id: "1",
    skill_name: "empatia",
    score: 72,
    explanation:
      "Demuestra empatía al saludar y mantener un tono amable, pero falla al conectar con los problemas específicos del cliente.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-2",
    user_id: "1",
    skill_name: "escucha",
    score: 55,
    explanation:
      "Interrumpe frecuentemente al cliente. Necesita practicar la escucha activa y usar pausas estratégicas.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-3",
    user_id: "1",
    skill_name: "preguntas",
    score: 65,
    explanation:
      "Hace preguntas abiertas pero no profundiza lo suficiente. Debería usar más preguntas de seguimiento.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-4",
    user_id: "1",
    skill_name: "negociacion",
    score: 48,
    explanation:
      "Manejo débil de objeciones. Necesita practicar técnicas de negociación como Feel-Felt-Found.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-5",
    user_id: "1",
    skill_name: "rapport",
    score: 78,
    explanation:
      "Excelente capacidad de establecer rapport inicial. Personaliza el saludo y muestra interés genuino.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-6",
    user_id: "1",
    skill_name: "cierre",
    score: 42,
    explanation:
      "Cierre débil. No utiliza técnicas de urgencia ni ofrece compromisos específicos.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-7",
    user_id: "1",
    skill_name: "descubrimiento",
    score: 60,
    explanation:
      "Identifica algunos pain points pero no profundiza en el impacto financiero o emocional.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-8",
    user_id: "1",
    skill_name: "objeciones",
    score: 45,
    explanation:
      "No maneja adecuadamente las objeciones de precio. Debería usar la técnica de recuadro y reencuadre.",
    updated_at: "2024-07-15T14:30:00Z",
  },
  {
    id: "skill-9",
    user_id: "1",
    skill_name: "confianza",
    score: 70,
    explanation:
      "Genera confianza inicial pero no la mantiene durante la presentación del precio.",
    updated_at: "2024-07-15T14:30:00Z",
  },
];

export const mockTeamRanking: TeamRanking[] = [
  {
    user: { ...mockUser, id: "2", full_name: "Ana García", email: "ana@empresa.com" },
    average_score: 88,
    total_calls: 22,
    improvement: 12,
  },
  {
    user: { ...mockUser, id: "1", full_name: "Carlos Mendoza", email: "carlos@empresa.com" },
    average_score: 76,
    total_calls: 18,
    improvement: 8,
  },
  {
    user: { ...mockUser, id: "3", full_name: "Luis Hernández", email: "luis@empresa.com" },
    average_score: 72,
    total_calls: 15,
    improvement: 15,
  },
  {
    user: { ...mockUser, id: "4", full_name: "María Torres", email: "maria@empresa.com" },
    average_score: 69,
    total_calls: 20,
    improvement: 5,
  },
  {
    user: { ...mockUser, id: "5", full_name: "Roberto Díaz", email: "roberto@empresa.com" },
    average_score: 65,
    total_calls: 12,
    improvement: -3,
  },
];

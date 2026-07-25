from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "seller"
    avatar_url: Optional[str] = None
    team_id: Optional[UUID] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None


class TeamCreate(TeamBase):
    pass


class TeamResponse(TeamBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CallBase(BaseModel):
    title: Optional[str] = None
    client_name: Optional[str] = None


class CallCreate(CallBase):
    pass


class CallResponse(CallBase):
    id: str
    user_id: str = "demo-user"
    audio_url: Optional[str] = None
    duration_seconds: Optional[int] = 0
    status: str
    progress: int = 0
    progress_text: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class TimelineEvent(BaseModel):
    id: str
    type: str
    label: str
    timestamp_seconds: int
    description: Optional[str] = None
    is_highlight: bool = False
    seller_action: Optional[str] = None
    client_reaction: Optional[str] = None
    score_impact: Optional[int] = 0


class Objection(BaseModel):
    text: str
    response: str
    handled_well: bool
    analysis: Optional[str] = None


class SellerBehavior(BaseModel):
    moment: str
    behavior: str
    impact: str
    suggestion: str


class ClientSentiment(BaseModel):
    moment: str
    sentiment: str
    indicator: str


class Correction(BaseModel):
    issue: str
    evidence: Optional[str] = None
    tactic: str
    ideal_response: str
    why_it_works: str


class AnalysisResponse(BaseModel):
    id: str
    call_id: str
    transcription: Optional[str] = None
    summary: Optional[str] = None
    overall_score: Optional[int] = None
    closing_probability: Optional[int] = None
    strengths: list[str] = []
    errors: list[str] = []
    objections: list[Objection] = []
    techniques_used: list[str] = []
    recommendations: list[str] = []
    corrections: list[Correction] = []
    next_steps: list[str] = []
    timeline: list[TimelineEvent] = []
    seller_behavior: list[SellerBehavior] = []
    client_sentiment: list[ClientSentiment] = []
    created_at: datetime

    class Config:
        from_attributes = True


class SellerSkillResponse(BaseModel):
    id: UUID
    user_id: UUID
    skill_name: str
    score: int
    explanation: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    calls_today: int
    calls_this_week: int
    average_score: float
    score_trend: float
    weekly_goal: dict
    recent_calls: list[CallResponse]


class CoachMessage(BaseModel):
    message: str
    call_id: Optional[UUID] = None


class CoachResponse(BaseModel):
    response: str
    suggestions: list[str] = []


class TeamRankingItem(BaseModel):
    user: UserResponse
    average_score: float
    total_calls: int
    improvement: float

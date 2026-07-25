import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String)
    role = Column(String, default="seller")
    avatar_url = Column(String)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    calls = relationship("Call", back_populates="user")
    skills = relationship("SellerSkill", back_populates="user")


class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", backref="owned_teams")
    members = relationship("User", back_populates="team")


class Call(Base):
    __tablename__ = "calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String)
    client_name = Column(String)
    audio_url = Column(String)
    duration_seconds = Column(Integer)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="calls")
    analysis = relationship("Analysis", back_populates="call", uselist=False)


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id = Column(UUID(as_uuid=True), ForeignKey("calls.id"), unique=True, nullable=False)
    transcription = Column(Text)
    summary = Column(Text)
    overall_score = Column(Integer)
    closing_probability = Column(Integer)
    strengths = Column(JSON, default=[])
    errors = Column(JSON, default=[])
    objections = Column(JSON, default=[])
    techniques_used = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])
    next_steps = Column(JSON, default=[])
    timeline = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="analysis")


class SellerSkill(Base):
    __tablename__ = "seller_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    score = Column(Integer, default=0)
    explanation = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skills")


class WeeklyGoal(Base):
    __tablename__ = "weekly_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    calls_target = Column(Integer, default=25)
    calls_completed = Column(Integer, default=0)
    quality_target = Column(Integer, default=80)
    quality_average = Column(DECIMAL, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

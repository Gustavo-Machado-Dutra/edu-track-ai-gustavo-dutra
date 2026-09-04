from fastapi import FastAPI
from pydantic import BaseModel, Field

from .metrics import (
    calculate_efficiency_by_difficulty,
    calculate_study_metrics,
    calculate_task_metrics,
    get_weekly_progress,
)


class HealthResponse(BaseModel):
    data: dict[str, str]


class TaskInput(BaseModel):
    id: str
    status: str
    dueDate: str | None = None
    difficulty: str | None = None


class StudySessionInput(BaseModel):
    subjectId: str
    startedAt: str
    durationMinutes: int = Field(ge=0)


class AnalyticsRequest(BaseModel):
    tasks: list[TaskInput] = Field(default_factory=list)
    sessions: list[StudySessionInput] = Field(default_factory=list)


app = FastAPI(
    title="EduTrack AI Analytics",
    description="Serviço interno de preparação analítica com Pandas",
    version="0.1.0",
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(data={"service": "analytics", "status": "ok"})


@app.post("/metrics", response_model=dict)
def metrics(payload: AnalyticsRequest) -> dict:
    tasks = [task.model_dump() for task in payload.tasks]
    sessions = [session.model_dump() for session in payload.sessions]

    return {
        "data": {
            "tasks": calculate_task_metrics(tasks),
            "study": calculate_study_metrics(sessions),
            "efficiencyByDifficulty": calculate_efficiency_by_difficulty(tasks),
            "weeklyProgress": get_weekly_progress(sessions),
        }
    }

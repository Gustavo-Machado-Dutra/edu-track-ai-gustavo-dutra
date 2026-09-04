"""MÃ©tricas analÃ­ticas para o EduTrack AI."""

from datetime import timedelta
from typing import TypedDict

import pandas as pd


class TaskMetrics(TypedDict):
    total: int
    completed: int
    pending: int
    overdue: int
    completion_rate: float


class StudyMetrics(TypedDict):
    total_minutes: int
    average_session: float
    sessions_count: int
    by_subject: dict[str, int]


def calculate_task_metrics(tasks: list[dict]) -> TaskMetrics:
    """Calcula mÃ©tricas de tarefas."""
    df = pd.DataFrame(tasks)

    if df.empty:
        return {
            'total': 0,
            'completed': 0,
            'pending': 0,
            'overdue': 0,
            'completion_rate': 0.0,
        }

    total = len(df)
    completed = len(df[df['status'] == 'COMPLETED'])
    pending = len(df[df['status'].isin(['TODO', 'PENDING', 'IN_PROGRESS'])])

    now = pd.Timestamp.now()
    due_dates = pd.to_datetime(df.get('dueDate'), errors='coerce')
    overdue = len(df[due_dates.lt(now) & df['status'].ne('COMPLETED')])

    completion_rate = (completed / total * 100) if total > 0 else 0.0

    return {
        'total': total,
        'completed': completed,
        'pending': pending,
        'overdue': overdue,
        'completion_rate': round(completion_rate, 2),
    }


def calculate_study_metrics(sessions: list[dict]) -> StudyMetrics:
    """Calcula mÃ©tricas de sessÃµes de estudo."""
    df = pd.DataFrame(sessions)

    if df.empty:
        return {
            'total_minutes': 0,
            'average_session': 0.0,
            'sessions_count': 0,
            'by_subject': {},
        }

    total_minutes = int(df['durationMinutes'].sum())
    sessions_count = len(df)
    average_session = round(df['durationMinutes'].mean(), 1)

    by_subject = df.groupby('subjectId')['durationMinutes'].sum().to_dict()
    by_subject = {str(k): int(v) for k, v in by_subject.items()}

    return {
        'total_minutes': total_minutes,
        'average_session': average_session,
        'sessions_count': sessions_count,
        'by_subject': by_subject,
    }


def calculate_efficiency_by_difficulty(tasks: list[dict]) -> dict[str, float]:
    """Calcula eficiÃªncia por nÃ­vel de dificuldade."""
    df = pd.DataFrame(tasks)

    if df.empty or 'difficulty' not in df.columns:
        return {}

    completed = df[df['status'] == 'COMPLETED']

    if completed.empty:
        return {}

    efficiency = completed.groupby('difficulty').size() / df.groupby('difficulty').size()
    return {k: round(v * 100, 1) for k, v in efficiency.to_dict().items()}


def get_weekly_progress(sessions: list[dict], days: int = 7) -> list[dict]:
    """Retorna progresso semanal de estudo."""
    df = pd.DataFrame(sessions)

    if df.empty:
        return []

    df['date'] = pd.to_datetime(df['startedAt']).dt.date
    start_date = pd.Timestamp.now().date() - timedelta(days=days - 1)

    weekly = df[df['date'] >= start_date].groupby('date')['durationMinutes'].sum()

    return [
        {'date': str(date), 'minutes': int(minutes)}
        for date, minutes in weekly.items()
    ]


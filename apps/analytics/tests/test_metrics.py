"""Testes para funções analíticas."""

from datetime import datetime, timedelta

import pytest

from app.metrics import (
    calculate_task_metrics,
    calculate_study_metrics,
    calculate_efficiency_by_difficulty,
    get_weekly_progress,
)


def test_calculate_task_metrics_empty():
    result = calculate_task_metrics([])
    assert result['total'] == 0
    assert result['completion_rate'] == 0.0


def test_calculate_task_metrics_with_data():
    tasks = [
        {'id': '1', 'status': 'COMPLETED', 'dueDate': datetime.now()},
        {'id': '2', 'status': 'PENDING', 'dueDate': datetime.now()},
        {'id': '3', 'status': 'COMPLETED', 'dueDate': datetime.now()},
    ]
    result = calculate_task_metrics(tasks)
    assert result['total'] == 3
    assert result['completed'] == 2
    assert result['pending'] == 1
    assert result['completion_rate'] == pytest.approx(66.67, 0.1)


def test_calculate_study_metrics_empty():
    result = calculate_study_metrics([])
    assert result['total_minutes'] == 0
    assert result['sessions_count'] == 0


def test_calculate_study_metrics_with_data():
    sessions = [
        {'subjectId': 's1', 'durationMinutes': 60, 'startedAt': datetime.now().isoformat()},
        {'subjectId': 's1', 'durationMinutes': 30, 'startedAt': datetime.now().isoformat()},
        {'subjectId': 's2', 'durationMinutes': 45, 'startedAt': datetime.now().isoformat()},
    ]
    result = calculate_study_metrics(sessions)
    assert result['total_minutes'] == 135
    assert result['sessions_count'] == 3
    assert result['average_session'] == 45.0
    assert result['by_subject']['s1'] == 90
    assert result['by_subject']['s2'] == 45


def test_calculate_efficiency_by_difficulty():
    tasks = [
        {'difficulty': 'EASY', 'status': 'COMPLETED'},
        {'difficulty': 'EASY', 'status': 'COMPLETED'},
        {'difficulty': 'MEDIUM', 'status': 'COMPLETED'},
        {'difficulty': 'MEDIUM', 'status': 'PENDING'},
        {'difficulty': 'HARD', 'status': 'PENDING'},
    ]
    result = calculate_efficiency_by_difficulty(tasks)
    assert result['EASY'] == 100.0
    assert result['MEDIUM'] == 50.0
    assert result['HARD'] == 0.0


def test_get_weekly_progress():
    now = datetime.now()
    sessions = [
        {'durationMinutes': 60, 'startedAt': now.isoformat()},
        {'durationMinutes': 30, 'startedAt': now.isoformat()},
    ]
    result = get_weekly_progress(sessions)
    assert len(result) > 0
    assert result[0]['minutes'] == 90

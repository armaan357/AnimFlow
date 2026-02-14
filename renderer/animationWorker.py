from celery import Celery

celeryApp = Celery(
    "animationWorker",
    broker= "redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celeryApp.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    result_expires=3600,  # 1 hour
)

# Import tasks to register them with the Celery app
import animationTasks

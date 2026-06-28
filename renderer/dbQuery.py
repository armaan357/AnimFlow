from database import SessionLocal
from models import AnimationVersion, Status
from sqlalchemy import select, func
from datetime import datetime, timedelta

def getData():
    session = SessionLocal()
    try:
        if(session):
            oneHourAgo = func.now() - timedelta(hours=1)
            resp = session.execute(select(AnimationVersion).where(AnimationVersion.createdAt < oneHourAgo, AnimationVersion.status == Status.ERROR)).scalars().all()
            for version in resp:
                print(f"version = {version}, now = {datetime.now()}")
                print("\n")
        else:
            print("session not defined")
    finally:
        session.close()

getData()
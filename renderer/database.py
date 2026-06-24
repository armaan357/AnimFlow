from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DB_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

metadata = MetaData()

Base = declarative_base()
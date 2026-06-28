from typing import Optional
import datetime
import enum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKeyConstraint, Index, Integer, PrimaryKeyConstraint, String, Text, text
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Status(str, enum.Enum):
    PENDING = 'PENDING'
    PROCESSING = 'PROCESSING'
    COMPLETED = 'COMPLETED'
    ERROR = 'ERROR'


class PrismaMigrations(Base):
    __tablename__ = '_prisma_migrations'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='_prisma_migrations_pkey'),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    migration_name: Mapped[str] = mapped_column(String(255), nullable=False)
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    applied_steps_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0'))
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))
    logs: Mapped[Optional[str]] = mapped_column(Text)
    rolled_back_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))


class User(Base):
    __tablename__ = 'user'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='user_pkey'),
        Index('user_email_key', 'email', unique=True),
        Index('user_githubId_key', 'githubId', unique=True),
        Index('user_googleId_key', 'googleId', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    userName: Mapped[str] = mapped_column(Text, nullable=False)
    createdAt: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updatedAt: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    password: Mapped[Optional[str]] = mapped_column(Text)
    googleId: Mapped[Optional[str]] = mapped_column(Text)
    providerURL: Mapped[Optional[str]] = mapped_column(Text, server_default=text("'email/password'::text"))
    refreshToken: Mapped[Optional[str]] = mapped_column(Text)
    githubId: Mapped[Optional[str]] = mapped_column(Text)

    animation: Mapped[list['Animation']] = relationship('Animation', back_populates='user')


class Animation(Base):
    __tablename__ = 'animation'
    __table_args__ = (
        ForeignKeyConstraint(['userId'], ['user.id'], ondelete='RESTRICT', onupdate='CASCADE', name='animation_userId_fkey'),
        PrimaryKeyConstraint('id', name='animation_pkey'),
        Index('animation_id_idx', 'id'),
        Index('animation_userId_idx', 'userId')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    firstPrompt: Mapped[str] = mapped_column(Text, nullable=False)
    isPublic: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'))
    createdAt: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updatedAt: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False)
    userId: Mapped[str] = mapped_column(Text, nullable=False)
    currentVersionId: Mapped[Optional[str]] = mapped_column(Text)

    user: Mapped['User'] = relationship('User', back_populates='animation')
    animationVersion: Mapped[list['AnimationVersion']] = relationship('AnimationVersion', back_populates='animation')


class AnimationVersion(Base):
    __tablename__ = 'animationVersion'
    __table_args__ = (
        ForeignKeyConstraint(['animationId'], ['animation.id'], ondelete='RESTRICT', onupdate='CASCADE', name='animationVersion_animationId_fkey'),
        PrimaryKeyConstraint('id', name='animationVersion_pkey'),
        Index('animationVersion_animationId_hash_key', 'animationId', 'hash', unique=True),
        Index('animationVersion_animationId_idx', 'animationId'),
        Index('animationVersion_taskId_idx', 'taskId'),
        Index('animationVersion_taskId_key', 'taskId', unique=True),
        Index('animationVersion_versionNo_animationId_key', 'versionNo', 'animationId', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    versionNo: Mapped[int] = mapped_column(Integer, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    createdAt: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    status: Mapped[Status] = mapped_column(Enum(Status, values_callable=lambda cls: [member.value for member in cls], name='Status'), nullable=False, server_default=text('\'PENDING\'::"Status"'))
    animationId: Mapped[str] = mapped_column(Text, nullable=False)
    taskId: Mapped[str] = mapped_column(Text, nullable=False)
    videoURL: Mapped[Optional[str]] = mapped_column(Text)
    errorMessage: Mapped[Optional[str]] = mapped_column(Text)
    durationSeconds: Mapped[Optional[int]] = mapped_column(Integer)
    fileSizeBytes: Mapped[Optional[int]] = mapped_column(Integer)
    renderTimeMs: Mapped[Optional[int]] = mapped_column(Integer)
    errorReason: Mapped[Optional[str]] = mapped_column(Text)
    hash: Mapped[Optional[str]] = mapped_column(Text)

    animation: Mapped['Animation'] = relationship('Animation', back_populates='animationVersion')

    def __repr__(self):
        return (
            f"AnimationVersion("
            f"id={self.id}, "
            f"versionNo={self.versionNo}, "
            f"status={self.status}, "
            f"createdAt={self.createdAt}), "
            f"type of datetime={type(self.createdAt)}, "
            f"tzinfo={self.createdAt.tzinfo}"
        )

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID, uuid4
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    current_role: Optional[str] = None
    previous_roles: List[str] = []
    education: List[dict] = []
    experience: List[dict] = []
    certifications: List[dict] = []
    social_links: dict = {}
    preferences: dict = {}

class UserCreate(UserBase):
    password: str

# Association table for user followers
followers = Table(
    'followers',
    Base.metadata,
    Column('follower_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('followed_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    bio = Column(Text, nullable=True)
    profile_picture = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    saved_jobs = relationship("JobSave", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    
    # Follow relationships
    following = relationship(
        "User",
        secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref="followers"
    )

class PostBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    media_urls: List[str] = []

class PostCreate(PostBase):
    pass

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class CommentBase(BaseModel):
    content: str
    media_urls: List[str] = []

class CommentCreate(CommentBase):
    post_id: UUID

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")

class JobSave(Base):
    __tablename__ = "job_saves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_title = Column(String)
    company = Column(String)
    location = Column(String)
    description = Column(Text)
    url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_jobs")

class MessageBase(BaseModel):
    content: str
    media_urls: List[str] = []

class MessageCreate(MessageBase):
    recipient_id: UUID

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

class Like(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    target_id: UUID
    target_type: str  # 'post' or 'comment'
    created_at: datetime = Field(default_factory=datetime.utcnow) 
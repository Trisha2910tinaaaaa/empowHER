from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDB):
    followers_count: int = 0
    following_count: int = 0

# Post schemas
class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class PostInDB(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Post(PostInDB):
    author: User
    comments_count: int = 0

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int

class CommentUpdate(BaseModel):
    content: Optional[str] = None

class CommentInDB(CommentBase):
    id: int
    post_id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Comment(CommentInDB):
    author: User

# Job schemas
class JobSaveBase(BaseModel):
    job_title: str
    company: str
    location: str
    description: str
    url: str

class JobSaveCreate(JobSaveBase):
    pass

class JobSaveInDB(JobSaveBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JobSave(JobSaveInDB):
    pass

# Message schemas
class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class MessageInDB(MessageBase):
    id: int
    sender_id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True

class Message(MessageInDB):
    sender: User
    receiver: User

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Response schemas
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    items: List[dict]

class UserResponse(BaseModel):
    user: User
    posts: List[Post]
    followers_count: int
    following_count: int

class PostResponse(BaseModel):
    post: Post
    comments: List[Comment]
    author: User

class MessageResponse(BaseModel):
    messages: List[Message]
    unread_count: int 
from fastapi import FastAPI, HTTPException, Query, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field, validator
import os
from dotenv import load_dotenv
import requests
import json
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search.tool import TavilySearchResults
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from database import get_db, SessionLocal
from sql_models import ChatHistory, User

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
DIFFBOT_API_KEY = os.getenv("DIFFBOT_API_KEY", "939b1f619b77603bacb76713807e5c15")

# Validate API keys
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY is missing. Set it in environment variables.")
    raise ValueError("GROQ_API_KEY is missing. Set it in environment variables.")
if not TAVILY_API_KEY:
    logger.error("TAVILY_API_KEY is missing. Set it in environment variables.")
    raise ValueError("TAVILY_API_KEY is missing. Set it in environment variables.")
if not DIFFBOT_API_KEY:
    logger.error("DIFFBOT_API_KEY is missing. Set it in environment variables.")
    raise ValueError("DIFFBOT_API_KEY is missing. Set it in environment variables.")

# Initialize FastAPI app
app = FastAPI(
    title="Women's Tech Job Search API",
    description="API for searching and retrieving job opportunities in tech with a focus on women-friendly roles",
    version="1.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM
def get_llm():
    return ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama3-70b-8192",
        temperature=0.7
    )

# Initialize Tavily Search Tool
def get_tavily_tool():
    return TavilySearchResults(
        tavily_api_key=TAVILY_API_KEY,
        max_results=15,
        search_depth="advanced",
        include_answer=False,
        include_raw_content=True,
        include_images=False,
        include_domains=[
            "linkedin.com/jobs/","linkedin.com","indeed.com", "glassdoor.com", 
            "levels.fyi", "internships.com", "dice.com", "techmothers.co",
            "techcareers.com", "angellist.com", "naukri.com", "powertofly.com",
            "womenwhocode.com", "girlgeek.io", "remote.co", "womenintech.co.uk",
            "remotewoman.com", "elpha.com", "fairygodboss.com"
        ],
        exclude_domains=[
            "reddit.com", "quora.com", "facebook.com", "twitter.com",
            "instagram.com", "youtube.com", "pinterest.com",
            "wikipedia.org", "blogspot.com", "medium.com", "wordpress.com"
        ],
    )

# Women-friendly keywords and companies
WOMEN_FRIENDLY_KEYWORDS = [
    'women in tech', 'diversity', 'inclusion', 'equal opportunity', 
    'women leadership', 'women empowerment', 'female entrepreneurs',
    'gender equality', 'work-life balance', 'flexible', 'parental leave',
    'maternity', 'mentorship', 'diverse', 'inclusive', 'equity'
]

WOMEN_FRIENDLY_COMPANIES = {
    'accenture', 'adobe', 'akamai', 'atlassian', 'bumble', 'dell', 'etsy', 
    'general motors', 'hpinc', 'hubspot', 'ibm', 'intuit', 'johnson & johnson', 
    'mastercard', 'microsoft', 'netflix', 'new relic', 'nvidia', 'paypal', 
    'salesforce', 'sap', 'shopify', 'slack', 'spotify', 'square', 'stripe', 
    'twitter', 'uber', 'workday', 'zoom', 'google', 'meta', 'amazon', 'apple',
    'pinterest', 'airbnb', 'asana', 'dropbox', 'gitlab', 'godaddy', 'linkedin',
    'mailchimp', 'mongodb', 'zendesk', 'twilio'
}

# Request and response models with enhanced validation
class SearchQuery(BaseModel):
    query: str = Field(default="", description="Search query for jobs")
    location: Optional[str] = Field(default=None, description="Job location")
    job_type: Optional[str] = Field(default=None, description="Type of job (internship, full-time, etc.)")
    company: Optional[str] = Field(default=None, description="Specific tech company")
    max_results: Optional[int] = Field(default=15, ge=1, le=50, description="Maximum number of results")
    women_friendly_only: Optional[bool] = Field(default=False, description="Only return women-friendly jobs")
    
    @validator('query')
    def query_not_empty(cls, v):
        if v.strip() == "":
            return "tech jobs for women"
        return v

class SkillInfo(BaseModel):
    name: str = Field(description="Skill name")
    level: Optional[str] = Field(default=None, description="Skill level (beginner, intermediate, expert)")

class JobBasic(BaseModel):
    title: str = Field(default="Unknown Job Title", description="Job title")
    company: str = Field(default="Unknown Company", description="Company name")
    location: Optional[str] = Field(default=None, description="Job location")
    job_type: Optional[str] = Field(default=None, description="Type of job")
    posting_date: Optional[str] = Field(default=None, description="Date of job posting")
    salary_range: Optional[str] = Field(default=None, description="Salary range")
    application_url: str = Field(description="URL of job listing")
    is_women_friendly: Optional[bool] = Field(default=None, description="Whether job is women-friendly")
    skills: Optional[List[str]] = Field(default_factory=list, description="Required skills")

class JobDetail(JobBasic):
    description: Optional[str] = Field(default=None, description="Job description")
    qualifications: Optional[List[str]] = Field(default_factory=list, description="Job qualifications")
    skills_required: Optional[List[SkillInfo]] = Field(default_factory=list, description="Skills required with level")
    benefits: Optional[List[str]] = Field(default_factory=list, description="Job benefits")
    why_women_friendly: Optional[List[str]] = Field(default_factory=list, description="Reasons job is women-friendly")
    additional_info: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional job information")

class SearchResponse(BaseModel):
    results: List[JobBasic] = Field(default_factory=list, description="List of job results")
    total_results: int = Field(description="Total number of results")
    query_time_ms: int = Field(description="Query execution time in milliseconds")
    women_friendly_count: int = Field(default=0, description="Number of women-friendly jobs found")

# Cache for job information to prevent redundant API calls
job_cache = {}

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    user_id: str
    messages: List[ChatMessage]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online", 
        "message": "Women's Tech Job Search API is running",
        "version": "1.1.0"
    }

@app.post("/api/search", response_model=SearchResponse, tags=["Search"])
async def search_jobs(
    search_params: SearchQuery,
    background_tasks: BackgroundTasks,
    tavily_tool: TavilySearchResults = Depends(get_tavily_tool)
):
    start_time = time.time()
    
    try:
        # Construct query with additional context
        query = "Tech job openings"
        
        if search_params.query:
            query += f" {search_params.query}"
        
        if search_params.job_type:
            query += f" {search_params.job_type} positions"
        
        if search_params.company:
            query += f" at {search_params.company}"
        
        if search_params.location:
            query += f" in {search_params.location}"
        
        # Add keywords for women-friendly and internship opportunities
        query += " (Women in Tech) (female-friendly workplace) (diversity inclusion)"
        
        logger.info(f"Searching for: {query}")
        
        # Execute search
        results = tavily_tool.invoke({"query": query})
        
        if not results:
            logger.warning(f"No search results found for query: {query}")
            return SearchResponse(
                results=[],
                total_results=0,
                query_time_ms=int((time.time() - start_time) * 1000),
                women_friendly_count=0
            )
        
        logger.info(f"Found {len(results)} search results")
        
        # Get job URLs
        job_urls = []
        for result in results:
            if 'url' in result and result['url']:
                job_urls.append(result['url'])
        
        # Process job URLs in parallel for better performance
        jobs = []
        women_friendly_jobs = 0
        
        with ThreadPoolExecutor(max_workers=min(10, len(job_urls))) as executor:
            future_to_url = {executor.submit(fetch_job_info, url): url for url in job_urls[:search_params.max_results]}
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    job_info = future.result()
                    if job_info:
                        # Count women-friendly jobs
                        if job_info.is_women_friendly:
                            women_friendly_jobs += 1
                        
                        # Apply women-friendly filter if requested
                        if not search_params.women_friendly_only or job_info.is_women_friendly:
                            jobs.append(job_info)
                except Exception as exc:
                    logger.error(f"Error processing {url}: {exc}")
        
        # Background task to update cache for detailed job info
        background_tasks.add_task(prefetch_job_details, [job.application_url for job in jobs])
        
        return SearchResponse(
            results=jobs,
            total_results=len(jobs),
            query_time_ms=int((time.time() - start_time) * 1000),
            women_friendly_count=women_friendly_jobs
        )
    
    except Exception as e:
        logger.error(f"Error in search_jobs: {e}")
        # Return empty results instead of throwing an error
        return SearchResponse(
            results=[], 
            total_results=0,
            query_time_ms=int((time.time() - start_time) * 1000),
            women_friendly_count=0
        )

def is_women_friendly(title: str, company: str, text: str) -> bool:
    """Determine if a job is women-friendly based on title, company, and text content"""
    
    # Check if the company is in our list of women-friendly companies
    if company and any(wfc.lower() in company.lower() for wfc in WOMEN_FRIENDLY_COMPANIES):
        return True
    
    # Check for women-friendly keywords in the job text and title
    combined_text = (text or "") + " " + (title or "") + " " + (company or "")
    combined_text = combined_text.lower()
    
    # Count the number of women-friendly keywords present
    keyword_count = sum(1 for keyword in WOMEN_FRIENDLY_KEYWORDS if keyword.lower() in combined_text)
    
    # If 2 or more keywords are present, consider it women-friendly
    return keyword_count >= 2

def extract_skills(text: str) -> List[str]:
    """Extract skills from job description text"""
    if not text:
        return []
    
    # Common tech skills to look for
    tech_skills = [
        'python', 'javascript', 'typescript', 'java', 'c\+\+', 'c#', 'ruby', 'go', 'php',
        'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express',
        'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'firebase',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
        'git', 'github', 'gitlab', 'bitbucket', 'agile', 'scrum', 'kanban',
        'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
        'ai', 'machine learning', 'deep learning', 'data science', 'tensorflow', 'pytorch',
        'product management', 'ux', 'ui', 'figma', 'sketch', 'adobe xd',
        'data analysis', 'tableau', 'power bi', 'excel', 'r', 'sas'
    ]
    
    # Find matches
    skills_found = set()
    for skill in tech_skills:
        if re.search(r'\b' + skill + r'\b', text.lower()):
            # Clean up the skill name (capitalize properly)
            clean_skill = skill.replace('\\', '')
            if clean_skill == 'html' or clean_skill == 'css' or clean_skill == 'aws' or clean_skill == 'gcp':
                skills_found.add(clean_skill.upper())
            elif clean_skill in ['ai', 'ui', 'ux']:
                skills_found.add(clean_skill.upper())
            else:
                skills_found.add(clean_skill.title())
    
    return list(skills_found)

def fetch_job_info(url: str) -> JobBasic:
    """Fetch basic job information from URL using Diffbot"""
    # Check cache first
    if url in job_cache:
        return job_cache[url]
    
    try:
        API_URL = f"https://api.diffbot.com/v3/analyze?token={DIFFBOT_API_KEY}&url={url}"
        
        response = requests.get(API_URL, timeout=10)
        
        # Handle unsuccessful responses gracefully
        if response.status_code != 200:
            logger.warning(f"Non-200 response from Diffbot: {response.status_code} for {url}")
            return JobBasic(
                title="Job Listing",
                company="Unknown Company",
                application_url=url
            )
        
        data = response.json()
        
        # Extract job information from Diffbot response
        if 'objects' in data and len(data['objects']) > 0:
            job_data = data['objects'][0]
            
            # Safely extract fields with default values
            title = job_data.get('title', 'Unknown Job')
            company = job_data.get('publisher', 'Unknown Company')
            
            # Extract text for analysis
            text = job_data.get('text', '')
            
            # Determine if job is women-friendly
            is_women_friendly_job = is_women_friendly(title, company, text)
            
            # Extract skills
            skills = extract_skills(text)
            
            # Create job object
            job_info = JobBasic(
                title=title,
                company=company,
                location=job_data.get('location'),
                job_type=job_data.get('jobType'),
                posting_date=job_data.get('date'),
                salary_range=job_data.get('salaryRange'),
                application_url=url,
                is_women_friendly=is_women_friendly_job,
                skills=skills
            )
            
            # Cache the result
            job_cache[url] = job_info
            
            return job_info
        
        # Fallback if no detailed info is found
        logger.warning(f"No objects found in Diffbot response for {url}")
        return JobBasic(
            title="Job Listing",
            company="Unknown Company",
            application_url=url
        )
    
    except Exception as e:
        # Log the error but return a minimal job basic object
        logger.error(f"Error in fetch_job_info for {url}: {e}")
        return JobBasic(
            title="Job Listing",
            company="Unknown Company", 
            application_url=url
        )

def prefetch_job_details(urls: List[str]):
    """Prefetch and cache job details in the background"""
    for url in urls:
        try:
            if url not in job_cache:
                fetch_job_info(url)
        except Exception as e:
            logger.error(f"Error prefetching job details for {url}: {e}")

def fetch_job_details(url: str) -> JobDetail:
    """Fetch detailed job information from URL using Diffbot"""
    try:
        # First get basic info (which might already be cached)
        basic_info = fetch_job_info(url)
        
        API_URL = f"https://api.diffbot.com/v3/analyze?token={DIFFBOT_API_KEY}&url={url}"
        
        response = requests.get(API_URL, timeout=10)
        
        # Handle unsuccessful responses
        if response.status_code != 200:
            # Return basic job info with empty additional fields
            return JobDetail(**basic_info.dict())
        
        data = response.json()
        
        # Extract additional details
        description = None
        qualifications = []
        skills_required = []
        benefits = []
        why_women_friendly = []
        additional_info = {}
        
        if 'objects' in data and len(data['objects']) > 0:
            job_data = data['objects'][0]
            
            # Safely extract description
            description = job_data.get('text')
            
            # Try to extract qualifications and skills
            if description:
                # Extract sections based on common headers
                sections = re.split(r'\n\s*(?:Requirements|Qualifications|About the Role|Responsibilities|Benefits|What You\'ll Do|Who You Are)\s*\n', description)
                
                if len(sections) > 1:
                    # First section is usually the job description
                    description = sections[0].strip()
                    
                    # Look for qualifications and requirements
                    for section in sections[1:]:
                        lines = [line.strip() for line in section.split('\n') if line.strip()]
                        
                        if any(kw in section.lower() for kw in ['qualif', 'require', 'who you are']):
                            qualifications.extend(lines[:5])  # Take up to 5 lines
                        
                        if any(kw in section.lower() for kw in ['benefit', 'offer', 'perks']):
                            benefits.extend(lines[:5])  # Take up to 5 lines
                
                # Extract women-friendly aspects
                if basic_info.is_women_friendly:
                    for keyword in WOMEN_FRIENDLY_KEYWORDS:
                        if keyword in description.lower():
                            # Find the sentence containing the keyword
                            sentences = re.split(r'(?<=[.!?])\s+', description)
                            for sentence in sentences:
                                if keyword in sentence.lower():
                                    why_women_friendly.append(sentence.strip())
                                    break
            
            # Create detailed job info
            detailed_info = JobDetail(
                **basic_info.dict(),
                description=description,
                qualifications=qualifications,
                benefits=benefits,
                why_women_friendly=why_women_friendly,
                additional_info=additional_info
            )
            
            return detailed_info
        
        # Fallback to basic info
        return JobDetail(**basic_info.dict())
    
    except Exception as e:
        logger.error(f"Error in fetch_job_details for {url}: {e}")
        # Return basic job info with empty additional fields
        return JobDetail(**basic_info.dict())

@app.get("/api/job/{job_url:path}", response_model=JobDetail, tags=["Job Details"])
async def get_job_details(job_url: str):
    """Get detailed information about a specific job"""
    try:
        # URL decoding might be needed
        job_url = job_url.replace('___', '://')
        
        # Get detailed job info
        job_details = fetch_job_details(job_url)
        
        return job_details
    
    except Exception as e:
        logger.error(f"Error getting job details: {e}")
        raise HTTPException(status_code=404, detail=f"Job not found or error processing: {str(e)}")

@app.get("/api/statistics", tags=["Statistics"])
async def get_statistics():
    """Get statistics about the job search API"""
    return {
        "cache_size": len(job_cache),
        "api_version": "1.1.0",
        "women_friendly_companies_count": len(WOMEN_FRIENDLY_COMPANIES),
        "status": "healthy"
    }

@app.post("/api/chat/session", tags=["Chat"])
async def create_chat_session(session: ChatSession, db: SessionLocal = Depends(get_db)):
    """Create a new chat session"""
    try:
        db_session = ChatHistory(
            user_id=session.user_id,
            messages=json.dumps([msg.dict() for msg in session.messages]),
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return {"session_id": db_session.id, "status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/sessions/{user_id}", tags=["Chat"])
async def get_chat_sessions(user_id: str, db: SessionLocal = Depends(get_db)):
    """Get all chat sessions for a user"""
    try:
        sessions = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).all()
        return [{
            "session_id": session.id,
            "messages": json.loads(session.messages),
            "created_at": session.created_at,
            "updated_at": session.updated_at
        } for session in sessions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/analyze", tags=["Chat"])
async def analyze_chat_history(chat_history: List[ChatMessage]):
    """Analyze chat history to provide insights and recommendations"""
    try:
        # Use LLM to analyze the conversation
        llm = get_llm()
        messages = [{"role": msg.role, "content": msg.content} for msg in chat_history]
        
        analysis_prompt = f"""
        Analyze the following conversation and provide:
        1. Key skills mentioned
        2. Career interests
        3. Potential job matches
        4. Recommended next steps
        5. Areas for improvement
        
        Conversation:
        {json.dumps(messages, indent=2)}
        """
        
        response = llm.invoke(analysis_prompt)
        return {"analysis": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/suggest", tags=["Chat"])
async def suggest_resources(chat_history: List[ChatMessage]):
    """Suggest learning resources based on chat history"""
    try:
        llm = get_llm()
        messages = [{"role": msg.role, "content": msg.content} for msg in chat_history]
        
        suggestion_prompt = f"""
        Based on this conversation, suggest:
        1. Relevant online courses
        2. Books to read
        3. Communities to join
        4. Skills to develop
        5. Networking opportunities
        
        Conversation:
        {json.dumps(messages, indent=2)}
        """
        
        response = llm.invoke(suggestion_prompt)
        return {"suggestions": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", tags=["Chat"])
async def chat_with_ai(message: str):
    """Chat with the AI assistant"""
    try:
        llm = get_llm()
        
        # Create a more focused prompt for career-related conversations
        prompt = f"""
        You are a career assistant focused on helping women in tech. 
        Provide helpful, supportive, and actionable advice.
        
        User message: {message}
        
        Consider:
        1. Career development
        2. Skill building
        3. Job search strategies
        4. Work-life balance
        5. Networking opportunities
        6. Industry trends
        7. Salary negotiation
        8. Professional growth
        
        Keep responses concise, practical, and encouraging.
        """
        
        response = llm.invoke(prompt)
        
        return {
            "response": response.content,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in chat_with_ai: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request. Please try again."
        )

# Main execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuizStartRequest(BaseModel):
    team_name: str = Field(..., min_length=1, max_length=100)
    team_leader_name: str = Field(..., min_length=1, max_length=100)
    team_leader_email: str = Field(..., min_length=5, max_length=100)

class QuizStartResponse(BaseModel):
    quiz_id: str
    message: str

class AnswerSubmission(BaseModel):
    question_id: int
    selected_option: str

class QuizSubmissionRequest(BaseModel):
    quiz_id: str
    answers: List[AnswerSubmission]
    tab_switch_count: int = 0

class QuizResult(BaseModel):
    quiz_id: str
    team_name: str
    team_leader_name: str
    team_leader_email: str
    score: int
    total_questions: int
    time_taken_microseconds: int
    start_time: datetime
    end_time: datetime
    tab_switch_count: int
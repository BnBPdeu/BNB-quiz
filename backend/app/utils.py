import json
import random
import uuid
from datetime import datetime
from typing import List, Dict, Any

def load_questions(file_path: str = "questions.json") -> List[Dict[str, Any]]:
    """
    Load questions from JSON file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return questions
    except FileNotFoundError:
        # Return sample questions if file not found
        return generate_sample_questions()
    except json.JSONDecodeError:
        raise Exception("Invalid questions.json format")

def generate_sample_questions() -> List[Dict[str, Any]]:
    """Generate sample questions if file doesn't exist"""
    return [
        {
            "id": i,
            "question": f"Sample Question {i}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
        }
        for i in range(1, 26)
    ]

def shuffle_questions(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Shuffle questions and their options
    """
    shuffled = questions.copy()
    random.shuffle(shuffled)
    
    for q in shuffled:
        options = q['options'].copy()
        random.shuffle(options)
        q['options'] = options
        
    return shuffled

def generate_quiz_id() -> str:
    """Generate unique quiz ID"""
    return str(uuid.uuid4())

def get_current_time_microseconds() -> int:
    """Get current time in microseconds"""
    return int(datetime.utcnow().timestamp() * 1_000_000)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import random
import os
import json
import uuid
from dotenv import load_dotenv
from typing import Dict

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Online Quiz System", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    allow_origins=["*"],  # Allow all origins for testing, change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load questions
try:
    with open('questions.json', 'r') as f:
        questions = json.load(f)
    print(f"✅ Loaded {len(questions)} questions")
except Exception as e:
    print(f"❌ Error loading questions: {e}")
    questions = []

# Store active quiz sessions
active_quizzes: Dict[str, dict] = {}

# Google Sheets integration
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
    
    if os.path.exists('service-account.json') and SPREADSHEET_ID:
        credentials = service_account.Credentials.from_service_account_file(
            'service-account.json', scopes=SCOPES)
        service = build('sheets', 'v4', credentials=credentials)
        sheet = service.spreadsheets()
        print("✅ Google Sheets connected")
    else:
        print("⚠️ Google Sheets credentials not found")
        sheet = None
        SPREADSHEET_ID = None
except Exception as e:
    print(f"⚠️ Google Sheets error: {e}")
    sheet = None
    SPREADSHEET_ID = None

# Helper functions
def generate_quiz_id():
    return str(uuid.uuid4())

def get_current_time_microseconds():
    return int(datetime.utcnow().timestamp() * 1_000_000)

def save_to_google_sheets(data):
    """Save quiz result to Google Sheets with time_taken column"""
    if not sheet or not SPREADSHEET_ID:
        print("📝 Google Sheets not configured, would save:", data)
        return True
    
    try:
        # Format time taken in seconds for better readability
        time_taken_seconds = data['time_taken_microseconds'] / 1_000_000
        minutes = int(time_taken_seconds // 60)
        seconds = int(time_taken_seconds % 60)
        time_taken_formatted = f"{minutes}m {seconds}s"
        
        values = [[
            data['quiz_id'],
            data['team_name'],
            data['team_leader_name'],
            data['team_leader_email'],
            data['score'],
            data['total_questions'],
            data['time_taken_microseconds'],
            time_taken_formatted,
            data['start_time'],
            data['end_time'],
            data['tab_switch_count']
        ]]
        
        # Update headers if this is first entry
        headers = [[
            'quiz_id',
            'team_name',
            'team_leader_name', 
            'team_leader_email',
            'score',
            'total_questions',
            'time_taken_microseconds',
            'time_taken_formatted',
            'start_time',
            'end_time',
            'tab_switch_count'
        ]]
        
        # Check if sheet is empty and add headers
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='A1:K1'
        ).execute()
        
        if not result.get('values'):
            sheet.values().update(
                spreadsheetId=SPREADSHEET_ID,
                range='A1:K1',
                valueInputOption='RAW',
                body={'values': headers}
            ).execute()
        
        # Append data
        body = {'values': values}
        result = sheet.values().append(
            spreadsheetId=SPREADSHEET_ID,
            range='A:K',
            valueInputOption='RAW',
            body=body
        ).execute()
        
        print(f"✅ Saved to Google Sheets: {data['quiz_id']}")
        return True
    except Exception as e:
        print(f"❌ Failed to save to Google Sheets: {e}")
        return False

@app.get("/")
async def root():
    return {
        "message": "Online Quiz System API",
        "version": "1.0.0",
        "questions_loaded": len(questions),
        "sheets_configured": sheet is not None
    }

@app.post("/start-quiz")
async def start_quiz(request: Request):
    """Start a new quiz session"""
    try:
        data = await request.json()
        team_name = data.get('team_name')
        team_leader_name = data.get('team_leader_name')
        team_leader_email = data.get('team_leader_email')
        
        if not all([team_name, team_leader_name, team_leader_email]):
            raise HTTPException(status_code=400, detail="All fields are required")
        
        quiz_id = generate_quiz_id()
        
        active_quizzes[quiz_id] = {
            "team_name": team_name,
            "team_leader_name": team_leader_name,
            "team_leader_email": team_leader_email,
            "start_time": datetime.utcnow().isoformat(),
            "start_time_microseconds": get_current_time_microseconds(),
            "tab_switch_count": 0
        }
        
        print(f"✅ Quiz started: {quiz_id}")
        
        return {
            "quiz_id": quiz_id,
            "message": "Quiz started successfully"
        }
        
    except Exception as e:
        print(f"❌ Error in start_quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/questions/{quiz_id}")
async def get_questions(quiz_id: str):
    """Get shuffled questions for the quiz"""
    try:
        if quiz_id not in active_quizzes:
            raise HTTPException(status_code=404, detail="Quiz session not found")
        
        if not questions:
            raise HTTPException(status_code=500, detail="No questions available")
        
        # Shuffle questions
        shuffled = questions.copy()
        random.shuffle(shuffled)
        
        # Shuffle options and remove answers
        result = []
        for q in shuffled:
            options = q['options'].copy()
            random.shuffle(options)
            result.append({
                "id": q["id"],
                "question": q["question"],
                "options": options
            })
        
        print(f"✅ Questions sent for quiz: {quiz_id}")
        return {"questions": result}
        
    except Exception as e:
        print(f"❌ Error in get_questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit")
async def submit_quiz(request: Request):
    """Submit quiz answers and calculate score"""
    try:
        data = await request.json()
        print(f"📥 Received submission: {data}")
        
        quiz_id = data.get('quiz_id')
        answers_data = data.get('answers', [])
        tab_switch_count = data.get('tab_switch_count', 0)
        
        if not quiz_id:
            raise HTTPException(status_code=400, detail="quiz_id is required")
        
        if quiz_id not in active_quizzes:
            raise HTTPException(status_code=404, detail="Quiz session not found")
        
        quiz_session = active_quizzes[quiz_id]
        
        # Calculate score
        score = 0
        correct_answers = {q["id"]: q["answer"] for q in questions}
        
        for answer in answers_data:
            question_id = answer.get('question_id')
            selected_option = answer.get('selected_option')
            
            if question_id in correct_answers and correct_answers[question_id] == selected_option:
                score += 1
        
        # Calculate time taken
        end_time = datetime.utcnow()
        end_time_microseconds = get_current_time_microseconds()
        time_taken = end_time_microseconds - quiz_session["start_time_microseconds"]
        
        # Prepare result data
        result_data = {
            "quiz_id": quiz_id,
            "team_name": quiz_session["team_name"],
            "team_leader_name": quiz_session["team_leader_name"],
            "team_leader_email": quiz_session["team_leader_email"],
            "score": score,
            "total_questions": 25,
            "time_taken_microseconds": time_taken,
            "start_time": quiz_session["start_time"],
            "end_time": end_time.isoformat(),
            "tab_switch_count": tab_switch_count
        }
        
        print(f"✅ Score calculated: {score}/25")
        print(f"✅ Correct answers mapping: {correct_answers}")
        
        # Save to Google Sheets
        save_to_google_sheets(result_data)
        
        # Remove from active quizzes
        del active_quizzes[quiz_id]
        print(f"✅ Quiz completed: {quiz_id}")
        
        # Return both score and correct answers for result page
        return {
            "score": score,
            "total_questions": 25,
            "time_taken_microseconds": time_taken,
            "correct_answers": correct_answers  # Send correct answers to frontend
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Submission error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/log-tab-switch/{quiz_id}")
async def log_tab_switch(quiz_id: str):
    """Log tab switching event"""
    if quiz_id in active_quizzes:
        active_quizzes[quiz_id]["tab_switch_count"] = active_quizzes[quiz_id].get("tab_switch_count", 0) + 1
        return {"message": "Tab switch logged"}
    raise HTTPException(status_code=404, detail="Quiz session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleSheetsDB:
    def __init__(self, credentials_file: str, spreadsheet_id: str):
        """
        Initialize Google Sheets connection
        
        Args:
            credentials_file: Path to service account JSON file
            spreadsheet_id: Google Sheets spreadsheet ID
        """
        self.spreadsheet_id = spreadsheet_id
        self.scopes = ['https://www.googleapis.com/auth/spreadsheets']
        
        try:
            # Authenticate with service account
            self.credentials = service_account.Credentials.from_service_account_file(
                credentials_file, scopes=self.scopes
            )
            self.service = build('sheets', 'v4', credentials=self.credentials)
            self.sheet = self.service.spreadsheets()
            
            # Initialize sheet with headers if empty
            self._initialize_sheet()
            logger.info("Google Sheets connection established successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets: {e}")
            raise

    def _initialize_sheet(self):
        """Initialize the sheet with headers if it's empty"""
        try:
            # Check if sheet has data
            result = self.sheet.values().get(
                spreadsheetId=self.spreadsheet_id,
                range='A:I'
            ).execute()
            
            values = result.get('values', [])
            
            if not values:
                # Add headers
                headers = [[
                    'quiz_id',
                    'team_name',
                    'team_leader_name',
                    'team_leader_email',
                    'score',
                    'total_questions',
                    'time_taken_microseconds',
                    'start_time',
                    'end_time',
                    'tab_switch_count'
                ]]
                
                self.sheet.values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range='A1:J1',
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
                
                logger.info("Sheet headers initialized")
                
        except HttpError as e:
            logger.error(f"Error initializing sheet: {e}")
            raise

    def insert_quiz_result(self, result_data: Dict[str, Any]) -> bool:
        """
        Insert quiz result into Google Sheets
        
        Args:
            result_data: Dictionary containing quiz results
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Prepare row data
            row = [[
                result_data.get('quiz_id', ''),
                result_data.get('team_name', ''),
                result_data.get('team_leader_name', ''),
                result_data.get('team_leader_email', ''),
                result_data.get('score', 0),
                result_data.get('total_questions', 25),
                result_data.get('time_taken_microseconds', 0),
                result_data.get('start_time', ''),
                result_data.get('end_time', ''),
                result_data.get('tab_switch_count', 0)
            ]]
            
            # Append row to sheet
            self.sheet.values().append(
                spreadsheetId=self.spreadsheet_id,
                range='A:J',
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body={'values': row}
            ).execute()
            
            logger.info(f"Quiz result inserted for quiz_id: {result_data.get('quiz_id')}")
            return True
            
        except HttpError as e:
            logger.error(f"Error inserting data into Google Sheets: {e}")
            return False

    def check_duplicate_email(self, email: str) -> bool:
        """
        Check if email already exists in the sheet
        
        Args:
            email: Email to check
            
        Returns:
            bool: True if email exists, False otherwise
        """
        try:
            result = self.sheet.values().get(
                spreadsheetId=self.spreadsheet_id,
                range='D:D'  # Column D contains emails
            ).execute()
            
            values = result.get('values', [])
            
            # Skip header row
            for row in values[1:]:
                if row and row[0] == email:
                    return True
                    
            return False
            
        except HttpError as e:
            logger.error(f"Error checking duplicate email: {e}")
            return False

    def check_duplicate_quiz_id(self, quiz_id: str) -> bool:
        """
        Check if quiz_id already exists in the sheet
        
        Args:
            quiz_id: Quiz ID to check
            
        Returns:
            bool: True if quiz_id exists, False otherwise
        """
        try:
            result = self.sheet.values().get(
                spreadsheetId=self.spreadsheet_id,
                range='A:A'  # Column A contains quiz_ids
            ).execute()
            
            values = result.get('values', [])
            
            # Skip header row
            for row in values[1:]:
                if row and row[0] == quiz_id:
                    return True
                    
            return False
            
        except HttpError as e:
            logger.error(f"Error checking duplicate quiz_id: {e}")
            return False
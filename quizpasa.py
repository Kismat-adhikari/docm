import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime

class QuizPasa:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("QUIZ_API_KEY")
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama3-8b-8192"
        
        # System prompt for QuizPasa personality
        self.system_prompt = """
        You are QuizPasa, an AI study assistant for the StudyBetter application. 
        Your communication style:
        - Direct and concise responses
        - Professional but approachable
        - Focused on providing useful information
        - Avoid excessive enthusiasm or overly friendly language
        - Keep responses brief unless detailed explanation is needed
        - Don't use excessive greetings or pleasantries
        
        Your main functions:
        - Help users understand how to use the StudyBetter platform
        - Answer questions about study techniques and learning strategies
        - Provide educational support and explanations
        - Help with general academic questions
        - Provide study guidance
        
        Keep responses helpful and to the point. If asked about non-educational topics, 
        briefly redirect to study-related topics without being overly apologetic.
        """
    
    def is_api_configured(self):
        """Check if API key is properly configured"""
        return self.api_key and self.api_key != "your-quiz-api-key-here"
    
    def get_chat_response(self, user_message, conversation_history=None, session_data=None):
        """
        Get a response from the chatbot for the given user message
        
        Args:
            user_message (str): The user's message
            conversation_history (list): Previous conversation messages (optional)
            session_data (dict): Current session data containing MCQs and flashcards (optional)
            
        Returns:
            dict: Response containing success status, message, and error if any
        """
        
        if not self.is_api_configured():
            return {
                "success": False,
                "message": "I'm QuizPasa, your study assistant. I need to be configured with an API key to help you. Please contact your administrator.",
                "error": "API key not configured"
            }
        
        try:
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Prepare messages with session context if available
            system_message = self.system_prompt
            
            if session_data and (session_data.get('mcqs') or session_data.get('flashcards')):
                context = "\nCurrent study materials:\n"
                
                if session_data.get('mcqs'):
                    context += "\nMCQs:\n"
                    for i, mcq in enumerate(session_data['mcqs'], 1):
                        context += f"Question {i}: {mcq['question']}\n"
                        for j, option in enumerate(mcq['options']):
                            context += f"  {chr(65+j)}) {option}\n"
                        context += f"Correct Answer: {chr(65+mcq['correct_answer'])}\n"
                
                if session_data.get('flashcards'):
                    context += "\nFlashcards:\n"
                    for i, card in enumerate(session_data['flashcards'], 1):
                        context += f"Card {i}:\n  Front: {card['front']}\n  Back: {card['back']}\n"
                
                system_message += "\n\nYou have access to the following study materials. Use this context to provide relevant answers:\n" + context
            
            messages = [
                {"role": "system", "content": system_message}
            ]
            
            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Prepare payload
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.5,  # Reduced temperature for more consistent, less creative responses
                "max_tokens": 400,   # Reduced max tokens for more concise responses
                "stream": False
            }
            
            # Make API call
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_message = result['choices'][0]['message']['content'].strip()
                
                return {
                    "success": True,
                    "message": ai_message,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_message = f"API Error: {response.status_code}"
                try:
                    error_data = response.json()
                    error_message += f" - {error_data.get('error', {}).get('message', 'Unknown error')}"
                except:
                    error_message += f" - {response.text}"
                
                return {
                    "success": False,
                    "message": "I'm having trouble connecting right now. Please try again.",
                    "error": error_message
                }
                
        except requests.RequestException as e:
            return {
                "success": False,
                "message": "Connection issues. Please try again later.",
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": "Something went wrong. Please try again.",
                "error": f"Unexpected error: {str(e)}"
            }
    
    def get_welcome_message(self):
        """Get a welcome message for new chat sessions"""
        return {
            "success": True,
            "message": "Hi, I'm QuizPasa. I can help you with study techniques, MCQs, flashcards, and academic questions. What do you need help with?",
            "timestamp": datetime.now().isoformat()
        }
    
    def get_study_tips(self):
        """Get general study tips"""
        tips = [
            "• Use active recall - test yourself instead of just re-reading",
            "• Practice spaced repetition with flashcards",
            "• Study in focused 25-minute sessions",
            "• Summarize key concepts in your own words",
            "• Focus on understanding, not just memorizing",
            "• Connect new information to what you already know"
        ]
        
        return {
            "success": True,
            "message": "Study tips:\n\n" + "\n".join(tips),
            "timestamp": datetime.now().isoformat()
        }

# Initialize QuizPasa instance
quiz_pasa = QuizPasa()

def handle_chat_message(user_message, conversation_history=None, session_data=None):
    """
    Main function to handle chat messages from the Flask app
    
    Args:
        user_message (str): The user's message
        conversation_history (list): Previous conversation messages
        session_data (dict): Current session data containing MCQs and flashcards
        
    Returns:
        dict: Response from QuizPasa
    """
    if not session_data or (not session_data.get('mcqs') and not session_data.get('flashcards')):
        if any(keyword in user_message.lower() for keyword in ['explain', 'question', 'answer', 'mcq', 'flashcard']):
            return {
                "success": True,
                "message": "No study materials found in your current session. Please upload a document to generate MCQs and flashcards first.",
                "timestamp": datetime.now().isoformat()
            }
    
    return quiz_pasa.get_chat_response(user_message, conversation_history, session_data)

def get_welcome_message():
    """Get welcome message for new sessions"""
    return quiz_pasa.get_welcome_message()
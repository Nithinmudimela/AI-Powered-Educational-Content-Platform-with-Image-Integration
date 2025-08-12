
import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///academic_platform.db'  # Fallback to SQLite
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Gemini API Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
    GEMINI_MODEL = 'gemini-1.5-flash'  # Or 'gemini-1.5-pro' if you have access
    GEMINI_TEMPERATURE = 0.7
    GEMINI_MAX_OUTPUT_TOKENS = 1024
    
    # Image API Configurations
    SHUTTERSTOCK_CONSUMER_KEY = os.environ.get('SHUTTERSTOCK_CONSUMER_KEY')
    SHUTTERSTOCK_CONSUMER_SECRET = os.environ.get('SHUTTERSTOCK_CONSUMER_SECRET')
    SHUTTERSTOCK_BASE_URL = 'https://api.shutterstock.com/v2'
    
    UNSPLASH_ACCESS_KEY = os.environ.get('UNSPLASH_ACCESS_KEY')
    UNSPLASH_BASE_URL = 'https://api.unsplash.com'
    
    PIXABAY_API_KEY = os.environ.get('PIXABAY_API_KEY')
    PIXABAY_BASE_URL = 'https://pixabay.com/api/'
    
    WIKIMEDIA_BASE_URL = 'https://commons.wikimedia.org/w/api.php'
    
    # Caching
    DIAGRAM_CACHE_DURATION = 3600  # 1 hour in seconds

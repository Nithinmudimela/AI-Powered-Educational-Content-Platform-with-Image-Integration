import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://username:password@localhost/academic_platform'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Keys
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    SHUTTERSTOCK_CONSUMER_KEY = os.environ.get('SHUTTERSTOCK_CONSUMER_KEY')
    SHUTTERSTOCK_CONSUMER_SECRET = os.environ.get('SHUTTERSTOCK_CONSUMER_SECRET')
    UNSPLASH_ACCESS_KEY = os.environ.get('UNSPLASH_ACCESS_KEY')
    PIXABAY_API_KEY = os.environ.get('PIXABAY_API_KEY')
    
    # API URLs
    GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
    SHUTTERSTOCK_BASE_URL = "https://api.shutterstock.com/v2"
    UNSPLASH_BASE_URL = "https://api.unsplash.com"
    PIXABAY_BASE_URL = "https://pixabay.com/api"
    WIKIMEDIA_BASE_URL = "https://commons.wikimedia.org/w/api.php"
    
    # Gemini Model Settings
    GEMINI_MODEL = "gemini-2.5-flash"
    GEMINI_TEMPERATURE = 0.7
    GEMINI_MAX_OUTPUT_TOKENS = 1000
    
    # Cache settings
    DIAGRAM_CACHE_DURATION = 86400  # 24 hours in seconds

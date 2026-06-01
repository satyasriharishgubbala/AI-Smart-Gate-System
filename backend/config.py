from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # Flask Settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-gate-system-secret-key-98765')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Database Settings
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME = os.environ.get('DB_NAME', 'smart_gate_db')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    
    # SMTP / Email Settings
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_EMAIL = os.environ.get('SMTP_EMAIL', 'dummy_email@example.com')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'dummy_password')
    
    # Base and Upload Directories
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    
    VISITOR_IMAGES_DIR = os.path.join(UPLOAD_FOLDER, 'visitor_images')
    QR_CODES_DIR = os.path.join(UPLOAD_FOLDER, 'qr_codes')
    
    # Maximum allowed payload (16 MB)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Allowed image file extensions for face recognition
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Programmatically ensure upload directories exist
os.makedirs(Config.VISITOR_IMAGES_DIR, exist_ok=True)
os.makedirs(Config.QR_CODES_DIR, exist_ok=True)

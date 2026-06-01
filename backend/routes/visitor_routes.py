import os
import uuid
import re
import logging
from flask import Blueprint, request, jsonify, current_app
from config import Config
from models.visitor_model import VisitorModel
from services.qr_service import QRService
from services.email_service import EmailService
from services.face_service import FaceService

logger = logging.getLogger("VisitorRoutes")
visitor_bp = Blueprint('visitor', __name__)

# Basic email validation regex
EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

def allowed_file(filename):
    """Checks if the uploaded file has a permitted extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@visitor_bp.route('/register', methods=['POST'])
def register_visitor():
    """
    POST /api/register
    Registers a new visitor. Receives fields as multipart/form-data.
    
    FormData parameters:
        name (str): Visitor full name
        email (str): Visitor email address
        phone (str): Visitor phone number
        purpose (str): Purpose of visit
        image (file): Photographic image containing the visitor's face
    """
    try:
        # 1. Parse text fields from the request form
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        purpose = request.form.get('purpose', '').strip()
        
        # 2. Validate input fields
        if not name or not email or not phone or not purpose:
            return jsonify({
                "error": "Bad Request",
                "message": "Missing required fields. 'name', 'email', 'phone', and 'purpose' are mandatory."
            }), 400
            
        if not re.match(EMAIL_REGEX, email):
            return jsonify({
                "error": "Bad Request",
                "message": "Invalid email address format."
            }), 400
            
        # 3. Validate image upload
        if 'image' not in request.files:
            return jsonify({
                "error": "Bad Request",
                "message": "Visitor face photo ('image') is required."
            }), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                "error": "Bad Request",
                "message": "No file was selected for upload."
            }), 400
            
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Unsupported Media Type",
                "message": f"Invalid file extension. Permitted types are: {', '.join(Config.ALLOWED_EXTENSIONS)}"
            }), 415
            
        # 4. Save image with secure unique name to avoid collisions
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        unique_img_name = f"visitor_{uuid.uuid4().hex}.{file_ext}"
        image_save_path = os.path.join(Config.VISITOR_IMAGES_DIR, unique_img_name)
        
        # Save image file to local uploads directory
        file.save(image_save_path)
        logger.info(f"Temporary image uploaded to: {image_save_path}")
        
        # 5. Face detection pre-check using OpenCV
        # Ensures that visitors upload an actual, clear photograph containing a human face
        face_detected = FaceService.detect_face(image_save_path)
        if not face_detected:
            # Delete the file to save disk space if validation fails
            if os.path.exists(image_save_path):
                os.remove(image_save_path)
            logger.warning("Visitor registration rejected: No face detected in uploaded image.")
            return jsonify({
                "error": "Unprocessable Entity",
                "message": "Face verification failed. Could not detect a human face in the uploaded image. Please check the lighting and upload a clear photo."
            }), 422
            
        # Path configuration for database storage
        relative_image_path = f"uploads/visitor_images/{unique_img_name}"
        
        # 6. Insert details into the database to generate visitor ID
        visitor_id = VisitorModel.create_visitor(
            name=name,
            email=email,
            phone=phone,
            purpose=purpose,
            image_path=relative_image_path
        )
        
        # 7. Generate unique QR Code
        qr_relative_path = QRService.generate_qr(visitor_id)
        
        # 8. Update database record with the generated QR code path
        VisitorModel.update_visitor_qr(visitor_id, qr_relative_path)
        
        # 9. Send email notification containing the QR code attachment
        email_sent = EmailService.send_visitor_pass(email, qr_relative_path)
        
        # 10. Return success response
        return jsonify({
            "message": "Visitor registration completed successfully.",
            "data": {
                "id": visitor_id,
                "name": name,
                "email": email,
                "phone": phone,
                "purpose": purpose,
                "image_path": relative_image_path,
                "qr_code": qr_relative_path,
                "email_sent": email_sent
            }
        }), 201
        
    except Exception as e:
        logger.exception(f"Exception raised during visitor registration: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "An error occurred while processing registration.",
            "details": str(e)
        }), 500

@visitor_bp.route('/visitors', methods=['GET'])
def get_visitors():
    """
    GET /api/visitors
    Retrieves list of all registered visitors.
    """
    try:
        visitors = VisitorModel.get_all_visitors()
        return jsonify({
            "count": len(visitors),
            "visitors": visitors
        }), 200
    except Exception as e:
        logger.exception(f"Exception raised while listing visitors: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Could not fetch visitor records.",
            "details": str(e)
        }), 500

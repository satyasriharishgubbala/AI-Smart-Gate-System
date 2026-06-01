import os
import uuid
import logging
from flask import Blueprint, request, jsonify
from config import Config
from models.visitor_model import VisitorModel
from models.entry_log_model import EntryLogModel
from services.face_service import FaceService

logger = logging.getLogger("SecurityRoutes")
security_bp = Blueprint('security', __name__)

def allowed_file(filename):
    """Checks if the uploaded file has a permitted extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@security_bp.route('/verify', methods=['POST'])
def verify_visitor():
    """
    POST /api/verify
    Processes gate check-in verification for a visitor.
    
    FormData parameters:
        visitor_id (str/int): The ID parsed from the visitor's scanned QR pass.
        image (file): The live webcam portrait capture of the visitor at the gate.
    """
    temp_img_path = None
    try:
        # 1. Parse and validate visitor_id
        visitor_id = request.form.get('visitor_id', '').strip()
        if not visitor_id:
            return jsonify({
                "error": "Bad Request",
                "message": "Missing mandatory field 'visitor_id'."
            }), 400
            
        # 2. Retrieve corresponding visitor records from the database
        visitor = VisitorModel.get_visitor_by_id(visitor_id)
        if not visitor:
            logger.warning(f"Verification rejected: Visitor ID {visitor_id} not found in database.")
            return jsonify({
                "error": "Not Found",
                "message": f"Invalid pass. No visitor found matching ID {visitor_id}."
            }), 404
            
        # 3. Parse and validate the live camera capture file
        if 'image' not in request.files:
            return jsonify({
                "error": "Bad Request",
                "message": "Live photo ('image') is required for gate facial verification."
            }), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                "error": "Bad Request",
                "message": "No live capture file was selected."
            }), 400
            
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Unsupported Media Type",
                "message": f"Invalid file format. Permitted types are: {', '.join(Config.ALLOWED_EXTENSIONS)}"
            }), 415
            
        # 4. Save the camera frame to a temporary path for OpenCV feature extraction
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        temp_img_name = f"temp_verify_{uuid.uuid4().hex}.{file_ext}"
        temp_img_path = os.path.join(Config.VISITOR_IMAGES_DIR, temp_img_name)
        
        file.save(temp_img_path)
        logger.info(f"Temporary check-in capture saved to: {temp_img_path}")
        
        # 5. Resolve absolute path of original registration photograph
        registered_img_path = os.path.abspath(os.path.join(Config.BASE_DIR, visitor['image_path']))
        
        # 6. Compare registered photo with live capture photo using OpenCV ORB feature alignment
        faces_match = FaceService.compare_faces(registered_img_path, temp_img_path)
        
        # 7. Write access result to logs (Allowed or Denied)
        status = "Allowed" if faces_match else "Denied"
        EntryLogModel.create_log(visitor_id, status)
        
        # 8. Dispatch gate decisions
        if faces_match:
            logger.info(f"Access ALLOWED for visitor ID {visitor_id} ({visitor['name']})")
            return jsonify({
                "status": "Allowed",
                "message": f"Verification successful. Access granted for {visitor['name']}.",
                "visitor": {
                    "id": visitor['id'],
                    "name": visitor['name'],
                    "email": visitor['email'],
                    "phone": visitor['phone'],
                    "purpose": visitor['purpose']
                }
            }), 200
        else:
            logger.warning(f"Access DENIED for visitor ID {visitor_id} ({visitor['name']}) - Face mismatch")
            return jsonify({
                "status": "Denied",
                "message": f"Verification failed. Facial characteristics do not match {visitor['name']}. Access denied.",
                "visitor": {
                    "id": visitor['id'],
                    "name": visitor['name']
                }
            }), 200
            
    except Exception as e:
        logger.exception(f"Exception during visitor gate check-in: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "An error occurred while executing gate verification.",
            "details": str(e)
        }), 500
        
    finally:
        # Clean up temporary captured file to prevent server disk bloat
        if temp_img_path and os.path.exists(temp_img_path):
            try:
                os.remove(temp_img_path)
                logger.info(f"Cleaned up temporary gate capture image: {temp_img_path}")
            except Exception as rm_err:
                logger.error(f"Failed to delete temp file: {rm_err}")

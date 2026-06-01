import logging
from flask import Blueprint, request, jsonify
from models.admin_model import AdminModel
from models.entry_log_model import EntryLogModel

logger = logging.getLogger("AdminRoutes")
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """
    POST /api/admin/login
    Authenticates administrator credentials.
    
    Accepts JSON body or FormData:
        username (str): Administrator username
        password (str): Administrator password
    """
    try:
        # Support both JSON payload and FormData
        if request.is_json:
            data = request.get_json() or {}
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
        else:
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '').strip()

        # Validate presence of fields
        if not username or not password:
            return jsonify({
                "error": "Bad Request",
                "message": "Missing credentials. 'username' and 'password' are required."
            }), 400

        # Query admin from database
        admin = AdminModel.get_admin_by_username(username)
        
        # Verify credentials
        # (Using simple string comparison to match schema.sql seeded 'admin123' plain password)
        if admin and admin['password'] == password:
            logger.info(f"Admin login successful for user: {username}")
            return jsonify({
                "message": "Authentication successful.",
                "admin": {
                    "id": admin['id'],
                    "username": admin['username']
                }
            }), 200
        else:
            logger.warning(f"Admin login failed for user: {username} - Invalid credentials")
            return jsonify({
                "error": "Unauthorized",
                "message": "Invalid username or password."
            }), 401

    except Exception as e:
        logger.exception(f"Exception during admin authentication: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "An error occurred while processing admin login.",
            "details": str(e)
        }), 500

@admin_bp.route('/logs', methods=['GET'])
def get_logs():
    """
    GET /api/logs
    Retrieves history logs of all gate check-in attempts.
    """
    try:
        logs = EntryLogModel.get_all_logs()
        return jsonify({
            "count": len(logs),
            "logs": logs
        }), 200
    except Exception as e:
        logger.exception(f"Exception raised while listing logs: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Could not retrieve access logs.",
            "details": str(e)
        }), 500

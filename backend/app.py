import os
import logging
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("App")

def create_app():
    """Application factory for configuring and running the Flask instance."""
    app = Flask(__name__)
    
    # Load configuration settings
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing (CORS) for React integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register API blueprints
    from routes.visitor_routes import visitor_bp
    from routes.admin_routes import admin_bp
    from routes.security_routes import security_bp
    
    app.register_blueprint(visitor_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(security_bp, url_prefix='/api')
    
    # Custom route to serve file uploads statically
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        """Serves files from the uploads directory securely."""
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested resource could not be found on the server."
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred on the server.",
            "details": str(error)
        }), 500
        
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            "error": "Payload Too Large",
            "message": "The uploaded image file exceeds the maximum permitted size limit of 16 MB."
        }), 413
        
    @app.route('/')
    def index():
        return jsonify({
            "status": "online",
            "message": "Welcome to the AI Smart Gate Access Management System REST API."
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    logger.info("Starting Flask application server on http://0.0.0.0:5000...")
    app.run(host='0.0.0.0', port=5000)

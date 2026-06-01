import logging
from database import execute_write, execute_read, execute_read_one

logger = logging.getLogger("VisitorModel")

class VisitorModel:
    @staticmethod
    def create_visitor(name, email, phone, purpose, image_path=None, qr_code=None):
        """
        Inserts a new visitor record into the MySQL database.
        
        Returns:
            int: The primary key ID of the newly inserted visitor.
        """
        query = """
            INSERT INTO visitors (name, email, phone, purpose, image_path, qr_code)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (name, email, phone, purpose, image_path, qr_code)
        try:
            visitor_id = execute_write(query, params)
            logger.info(f"Successfully inserted visitor. Assigned ID: {visitor_id}")
            return visitor_id
        except Exception as e:
            logger.error(f"Failed to create visitor: {e}")
            raise e

    @staticmethod
    def get_visitor_by_id(visitor_id):
        """
        Retrieves a visitor record by its primary key ID.
        
        Returns:
            dict or None: The visitor row dictionary or None if not found.
        """
        query = "SELECT * FROM visitors WHERE id = %s"
        try:
            return execute_read_one(query, (visitor_id,))
        except Exception as e:
            logger.error(f"Failed to retrieve visitor by id {visitor_id}: {e}")
            raise e

    @staticmethod
    def get_all_visitors():
        """
        Retrieves all visitor records from the database ordered by registration time.
        
        Returns:
            list of dict: List of all registered visitors.
        """
        query = "SELECT * FROM visitors ORDER BY created_at DESC"
        try:
            return execute_read(query)
        except Exception as e:
            logger.error(f"Failed to retrieve all visitors: {e}")
            raise e

    @staticmethod
    def update_visitor_qr(visitor_id, qr_code_path):
        """
        Updates the qr_code path for a specific visitor.
        
        Returns:
            int: The number of affected rows.
        """
        query = "UPDATE visitors SET qr_code = %s WHERE id = %s"
        try:
            result = execute_write(query, (qr_code_path, visitor_id))
            logger.info(f"Updated QR code path for visitor ID {visitor_id} to: {qr_code_path}")
            return result
        except Exception as e:
            logger.error(f"Failed to update QR code for visitor ID {visitor_id}: {e}")
            raise e

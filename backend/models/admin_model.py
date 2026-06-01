import logging
from database import execute_read_one

logger = logging.getLogger("AdminModel")

class AdminModel:
    @staticmethod
    def get_admin_by_username(username):
        """
        Retrieves an administrator's record by username.
        
        Returns:
            dict or None: The admin row dictionary or None if not found.
        """
        query = "SELECT * FROM admin WHERE username = %s"
        try:
            return execute_read_one(query, (username,))
        except Exception as e:
            logger.error(f"Failed to fetch admin by username {username}: {e}")
            raise e

import logging
from database import execute_write, execute_read

logger = logging.getLogger("EntryLogModel")

class EntryLogModel:
    @staticmethod
    def create_log(visitor_id, status):
        """
        Creates a new entry log record in the database.
        
        Args:
            visitor_id (int): The ID of the visitor.
            status (str): The verification status ('Allowed' or 'Denied').
            
        Returns:
            int: The primary key ID of the newly inserted log record.
        """
        query = """
            INSERT INTO entry_logs (visitor_id, status)
            VALUES (%s, %s)
        """
        params = (visitor_id, status)
        try:
            log_id = execute_write(query, params)
            logger.info(f"Successfully recorded entry log. Log ID: {log_id} | Visitor: {visitor_id} | Status: {status}")
            return log_id
        except Exception as e:
            logger.error(f"Failed to write entry log for visitor {visitor_id}: {e}")
            raise e

    @staticmethod
    def get_all_logs():
        """
        Retrieves all entry logs joined with details of corresponding visitors.
        
        Returns:
            list of dict: Joint log and visitor records.
        """
        query = """
            SELECT 
                el.id AS log_id,
                el.visitor_id,
                el.entry_time,
                el.status,
                v.name AS visitor_name,
                v.email AS visitor_email,
                v.phone AS visitor_phone,
                v.purpose AS visitor_purpose
            FROM entry_logs el
            JOIN visitors v ON el.visitor_id = v.id
            ORDER BY el.entry_time DESC
        """
        try:
            return execute_read(query)
        except Exception as e:
            logger.error(f"Failed to fetch joint entry logs: {e}")
            raise e

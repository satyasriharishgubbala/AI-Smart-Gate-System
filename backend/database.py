import mysql.connector
from mysql.connector import pooling
import logging
import sys
from config import Config

# Configure logging for database operations
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("Database")

# Global pool variable
db_pool = None

def init_db_pool():
    """Initializes the MySQL connection pool using Config settings."""
    global db_pool
    if db_pool is None:
        try:
            logger.info("Attempting to connect to MySQL and initialize the connection pool...")
            pool_config = {
                "host": Config.DB_HOST,
                "user": Config.DB_USER,
                "password": Config.DB_PASSWORD,
                "database": Config.DB_NAME,
                "port": Config.DB_PORT,
                "pool_name": "smart_gate_pool",
                "pool_size": 10,  # Maintain up to 10 connections in pool
                "autocommit": False
            }
            db_pool = pooling.MySQLConnectionPool(**pool_config)
            logger.info("MySQL Connection Pool successfully created and ready.")
        except mysql.connector.Error as err:
            logger.error(f"Failed to create MySQL connection pool: {err}")
            # Do not raise here to prevent module import crashing if MySQL isn't running yet,
            # but log the incident so that developers can troubleshoot easily.
            db_pool = None

# Eager initialization attempt on module loading
try:
    init_db_pool()
except Exception as e:
    logger.error(f"Eager DB pool init failed: {e}")

def get_connection():
    """Acquires a connection from the pool, initializing the pool if needed."""
    global db_pool
    if db_pool is None:
        init_db_pool()
    if db_pool is None:
        raise mysql.connector.Error(
            msg="Database connection pool is uninitialized. Ensure MySQL is running and credentials are correct."
        )
    try:
        return db_pool.get_connection()
    except mysql.connector.Error as err:
        logger.error(f"Failed to grab database connection from pool: {err}")
        raise err

def execute_read(query, params=None):
    """
    Executes a SELECT query and returns all matching rows as dictionaries.
    
    Args:
        query (str): The SQL query to execute.
        params (tuple, optional): Query bind parameters.
        
    Returns:
        list of dict: Rows matching the query.
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        # dictionary=True returns rows as dictionaries e.g. {'id': 1, 'name': 'John'}
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        results = cursor.fetchall()
        return results
    except mysql.connector.Error as err:
        logger.error(f"Database Read Query Failed: {err} | Query: {query}")
        raise err
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()  # Returns connection back to pool

def execute_read_one(query, params=None):
    """
    Executes a SELECT query and returns a single matching row as a dictionary.
    
    Args:
        query (str): The SQL query to execute.
        params (tuple, optional): Query bind parameters.
        
    Returns:
        dict or None: The row dictionary or None if no match.
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchone()
        return result
    except mysql.connector.Error as err:
        logger.error(f"Database Read One Query Failed: {err} | Query: {query}")
        raise err
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def execute_write(query, params=None):
    """
    Executes a write operation (INSERT, UPDATE, DELETE) inside a transaction.
    If it's an INSERT query, it returns the auto-incremented lastrowid.
    Otherwise, it returns the number of affected rows.
    
    Args:
        query (str): The SQL statement to run.
        params (tuple, optional): Query bind parameters.
        
    Returns:
        int: The last inserted ID or the count of affected rows.
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query, params or ())
        connection.commit()
        last_id = cursor.lastrowid
        affected_rows = cursor.rowcount
        # Return last inserted id if it's an INSERT statement, otherwise affected rows
        return last_id if last_id else affected_rows
    except mysql.connector.Error as err:
        if connection:
            try:
                connection.rollback()
                logger.info("Transaction rolled back successfully after error.")
            except mysql.connector.Error as rb_err:
                logger.error(f"Failed to rollback transaction: {rb_err}")
        logger.error(f"Database Write Query Failed: {err} | Query: {query}")
        raise err
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

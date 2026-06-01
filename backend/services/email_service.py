import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from config import Config

logger = logging.getLogger("EmailService")

class EmailService:
    @staticmethod
    def send_visitor_pass(email, qr_relative_path):
        """
        Sends an email containing the visitor entry pass (QR code) as an attachment.
        
        Args:
            email (str): The recipient's email address.
            qr_relative_path (str): The relative path of the QR code image.
            
        Returns:
            bool: True if sent successfully, False otherwise.
        """
        # Resolve the full absolute path of the QR code file
        full_qr_path = os.path.abspath(os.path.join(Config.BASE_DIR, qr_relative_path))
        
        # Build the email headers and body
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = email
        msg['Subject'] = "Your Smart Gate Entry Pass"
        
        body_text = (
            "Dear Visitor,\n\n"
            "Your registration with the AI Smart Gate Access System was successful.\n"
            "Please find your digital entry pass (QR code) attached to this email.\n"
            "Scan this QR code at the security gate for quick check-in verification.\n\n"
            "Best regards,\n"
            "Smart Gate Access Control Team"
        )
        msg.attach(MIMEText(body_text, 'plain'))
        
        # Check if the QR code image exists locally and attach it
        if os.path.exists(full_qr_path):
            try:
                with open(full_qr_path, 'rb') as f:
                    img_data = f.read()
                    # MIMEImage detects the image type automatically
                    qr_attachment = MIMEImage(img_data, name=os.path.basename(full_qr_path))
                    qr_attachment.add_header(
                        'Content-Disposition', 
                        'attachment', 
                        filename=os.path.basename(full_qr_path)
                    )
                    msg.attach(qr_attachment)
            except Exception as read_err:
                logger.error(f"Could not read QR code file to attach: {read_err}")
        else:
            logger.error(f"QR code attachment file not found at: {full_qr_path}")
            
        # Check for mock settings to prevent connection timeout errors in development
        if Config.SMTP_EMAIL == 'dummy_email@example.com' or not Config.SMTP_EMAIL or not Config.SMTP_PASSWORD:
            logger.warning("=" * 60)
            logger.warning("SMTP credentials are not configured in config.py.")
            logger.warning(f"MOCK EMAIL SENT TO: {email}")
            logger.warning(f"ATTACHMENT GENERATED AT: {full_qr_path}")
            logger.warning("=" * 60)
            return False
            
        try:
            # Connect to SMTP server using TLS
            logger.info(f"Connecting to SMTP server {Config.SMTP_SERVER}:{Config.SMTP_PORT}...")
            server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
            server.starttls()
            
            # Authenticate with credentials
            server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
            
            # Dispatch message
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Gate pass email successfully sent to {email}")
            return True
            
        except Exception as smtp_err:
            # Log the error but do not crash the route. Visitor record is already saved in the database
            logger.error(f"Failed to deliver email to {email}: {smtp_err}")
            logger.warning("Database registration succeeded, but email delivery failed.")
            return False

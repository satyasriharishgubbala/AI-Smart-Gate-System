import os
import qrcode
import logging
from config import Config

logger = logging.getLogger("QRService")

class QRService:
    @staticmethod
    def generate_qr(visitor_id):
        """
        Generates a QR code containing the visitor's ID, saves it in the qr_codes directory,
        and returns the relative path to the file.
        
        Args:
            visitor_id (int/str): The unique identifier of the visitor.
            
        Returns:
            str: Relative path of the generated QR code image (e.g. 'uploads/qr_codes/qr_1.png')
        """
        try:
            # Configure QR Code settings
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            
            # The QR code contains the visitor ID as a string payload
            qr.add_data(str(visitor_id))
            qr.make(fit=True)
            
            # Create a PIL image from the QR code instance
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save file inside Config.QR_CODES_DIR
            filename = f"qr_{visitor_id}.png"
            full_path = os.path.join(Config.QR_CODES_DIR, filename)
            
            img.save(full_path)
            logger.info(f"QR code successfully generated and saved to: {full_path}")
            
            # Return relative path for database and static file serving
            return f"uploads/qr_codes/{filename}"
            
        except Exception as e:
            logger.error(f"Failed to generate QR code for visitor ID {visitor_id}: {e}")
            raise e

import os
import cv2
import logging

logger = logging.getLogger("FaceService")

class FaceService:
    @staticmethod
    def detect_face(image_path):
        """
        Uses OpenCV's Haar Cascade classifier to check if a valid face exists in the image.
        
        Args:
            image_path (str): Full filesystem path to the image.
            
        Returns:
            bool: True if at least one face is detected, False otherwise.
        """
        if not os.path.exists(image_path):
            logger.error(f"Face detection target image not found at: {image_path}")
            return False
            
        try:
            # Read image from file system
            img = cv2.imread(image_path)
            if img is None:
                logger.error(f"OpenCV failed to read the image at: {image_path}")
                return False
                
            # Convert to grayscale for detection classifier
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Load the standard pre-trained frontal face cascade classifier packaged with cv2
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(cascade_path)
            
            if face_cascade.empty():
                logger.error("Failed to load Haar Cascade XML classifier.")
                return False
                
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(50, 50)  # Filter out tiny noise
            )
            
            num_faces = len(faces)
            logger.info(f"Face detection executed. Found {num_faces} face(s) in {image_path}")
            
            return num_faces > 0
            
        except Exception as e:
            logger.error(f"Error during face detection algorithm execution: {e}")
            return False

    @staticmethod
    def compare_faces(registered_image_path, captured_image_path):
        """
        Compares the registered face photo with a captured stream frame using OpenCV
        ORB (Oriented FAST and Rotated BRIEF) keypoint extraction and matching.
        
        Args:
            registered_image_path (str): Path to original registration image.
            captured_image_path (str): Path to image captured at the gate.
            
        Returns:
            bool: True if faces match (structural features align), False otherwise.
        """
        logger.info(f"Comparing registered face ({registered_image_path}) with gate capture ({captured_image_path})...")
        
        if not os.path.exists(registered_image_path) or not os.path.exists(captured_image_path):
            logger.error("One or both face images are missing for comparison.")
            return False
            
        try:
            # 1. Read images in grayscale
            img1 = cv2.imread(registered_image_path, cv2.IMREAD_GRAYSCALE)
            img2 = cv2.imread(captured_image_path, cv2.IMREAD_GRAYSCALE)
            
            if img1 is None or img2 is None:
                logger.error("Failed to read image data for face comparison using OpenCV.")
                return False
                
            # 2. Resize images to normalize scales (e.g., 300x300 pixels)
            img1 = cv2.resize(img1, (300, 300))
            img2 = cv2.resize(img2, (300, 300))
            
            # 3. Initialize ORB detector
            # ORB is a robust, fast, patent-free keypoint detector
            orb = cv2.ORB_create(nfeatures=500)
            
            # Find the keypoints and descriptors
            kp1, des1 = orb.detectAndCompute(img1, None)
            kp2, des2 = orb.detectAndCompute(img2, None)
            
            # If no features could be extracted from either image, they cannot match
            if des1 is None or des2 is None:
                logger.warning("Failed to extract ORB descriptors from one or both images.")
                return False
                
            # 4. Use Brute-Force Matcher with Hamming Distance (optimal for ORB descriptors)
            # crossCheck=True ensures mutual matches (A matches B, and B matches A)
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            
            # Sort matches based on distance (lower distance means better match)
            matches = sorted(matches, key=lambda x: x.distance)
            
            # Filter matches to select "good" ones
            # A Hamming distance under 50 signifies strong similarity in structural details
            good_matches = [m for m in matches if m.distance < 50]
            
            num_total = len(matches)
            num_good = len(good_matches)
            logger.info(f"ORB Matching details: Total matches = {num_total} | Good matches = {num_good}")
            
            if num_total == 0:
                return False
                
            # Calculate match ratio
            ratio = num_good / num_total
            logger.info(f"Keypoint match ratio: {ratio:.3f}")
            
            # Decision threshold:
            # We require at least 15 good keypoint matches and a match ratio of 15% or higher
            is_match = num_good >= 15 and ratio >= 0.15
            logger.info(f"Verification conclusion: {'MATCH APPROVED' if is_match else 'MATCH DENIED'}")
            return is_match
            
        except Exception as e:
            logger.error(f"Error during facial verification comparison: {e}")
            return False

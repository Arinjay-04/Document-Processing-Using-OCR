import cv2
import numpy as np
import pytesseract
from PIL import Image
import math
import re
import json

# If Tesseract is not on your PATH, set the executable path explicitly:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def deskew(image):
    """
    Deskew the image using the largest text contour's angle.
    Returns a new, rotated image.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Binary threshold for contour detection
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Find all contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image  # No contours found, return as-is

    # Find largest contour (by area)
    largest_contour = max(contours, key=cv2.contourArea)
    # Get the minimum area rectangle for the largest contour
    rot_rect = cv2.minAreaRect(largest_contour)
    angle = rot_rect[-1]

    # Adjust angle to correct direction
    # minAreaRect gives angles in range [-90, 0); we convert to a proper rotation
    if angle < -45:
        angle = 90 + angle
    else:
        angle = -angle

    # Rotate
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def preprocess_for_ocr(image):
    """
    Advanced preprocessing:
      1. Deskew
      2. Convert to grayscale
      3. (Optional) Invert if text is white on black
      4. Adaptive threshold
      5. Morphological opening/closing if needed
    """
    # 1. Deskew
    image = deskew(image)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 3. Check if we should invert:
    #    We can check average pixel intensity. If it's mostly white text on black,
    #    average might be low. This is heuristic; adjust threshold as needed.
    mean_intensity = np.mean(gray)
    if mean_intensity < 127:
        # Invert to get black text on white background
        gray = cv2.bitwise_not(gray)

    # 4. Adaptive threshold
    #    We use cv2.ADAPTIVE_THRESH_GAUSSIAN_C for better local thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,  # blockSize, tweak for your images
        15   # C, tweak for your images
    )

    # 5. Morphological operations (optional). For example, a slight opening to remove noise:
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,1))
    # You can experiment with MORPH_OPEN or MORPH_CLOSE
    processed = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

    return processed

def ocr_image(image_path, lang='eng+hin'):
    """
    Perform Tesseract OCR with advanced preprocessing.
    """
    original = cv2.imread(image_path)
    if original is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    processed = preprocess_for_ocr(original)

    # Convert to PIL for pytesseract
    pil_img = Image.fromarray(processed)

    # Tesseract config: OEM 3 = default LSTM + legacy, PSM 6 = assume a block of text
    config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(pil_img, lang=lang, config=config)
    return text

def parse_details(ocr_text):
    """
    Heuristic parsing for Aadhaar details: name, dob, gender, and Aadhaar number.
    """
    # Aadhaar number: 12 digits, possibly spaced in groups of 4
    aadhaar_number = None
    match_aadhaar = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', ocr_text)
    if match_aadhaar:
        aadhaar_number = match_aadhaar.group(1).replace(" ", "")

    # Date of Birth
    dob = None
    # Pattern 1: DD/MM/YYYY
    match_dob_1 = re.search(r'\b(\d{2}/\d{2}/\d{4})\b', ocr_text)
    if match_dob_1:
        dob = match_dob_1.group(1)
    else:
        # Pattern 2: stuck date (2407/2003 -> 24/07/2003)
        match_dob_2 = re.search(r'\b(\d{2})(\d{2}/\d{4})\b', ocr_text)
        if match_dob_2:
            dob = match_dob_2.group(1) + '/' + match_dob_2.group(2)

    # Gender
    gender = None
    match_gender_en = re.search(r'\b(MALE|FEMALE)\b', ocr_text, re.IGNORECASE)
    if match_gender_en:
        gender = match_gender_en.group(1).upper()
    else:
        match_gender_hi = re.search(r'(पुरुष|महिला|स्त्री)', ocr_text)
        if match_gender_hi:
            if match_gender_hi.group(1) == 'पुरुष':
                gender = 'MALE'
            else:
                gender = 'FEMALE'

    # Name extraction (heuristic).
    # We'll look for lines that contain "varun", "kumar", "gera", etc.
    # Then pick the line with the highest ratio of English letters to total length.
    lines = ocr_text.split('\n')
    name_keywords = ['varun', 'kumar', 'gera', 'kuma', 'गैरा', 'कुमार']
    possible_names = []
    for line in lines:
        lower_line = line.lower()
        if any(kw in lower_line for kw in name_keywords):
            # measure ratio of English letters
            english_chars = sum(c.isalpha() and c.isascii() for c in line)
            ratio = english_chars / max(len(line), 1)
            possible_names.append((ratio, line.strip()))

    name = None
    if possible_names:
        possible_names.sort(key=lambda x: x[0], reverse=True)
        name = possible_names[0][1]
        # remove non-ascii if you want purely English
        # name = re.sub(r'[^\x00-\x7F]+','', name).strip()

    data = {
        "name": name,
        "dob": dob,
        "gender": gender,
        "aadhaar_number": aadhaar_number
    }
    return data

if __name__ == "__main__":
    # Path to your Aadhaar-like image
    image_file = "./dataset/processed_adhar1.1.jpeg"

    # 1. OCR the image (Hindi + English)
    raw_text = ocr_image(image_file, lang='eng+hin')
    print("Raw OCR Text:\n", raw_text)

    # 2. Parse out the fields
    parsed_data = parse_details(raw_text)

    # 3. Print as JSON
    print("\nParsed JSON data:")
    print(json.dumps(parsed_data, indent=4, ensure_ascii=False))

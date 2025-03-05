import cv2
import numpy as np
import re
import json
from doctr.io import DocumentFile
from doctr.models import ocr_predictor

# Step 1: Pre-process the input image
def preprocess_image(image_path):
    # Read the image in grayscale mode
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Image at {image_path} could not be loaded.")
    
    # Apply a median blur to remove noise
    img_blur = cv2.medianBlur(img, 3)
    
    # Use adaptive thresholding to create a binary image
    img_thresh = cv2.adaptiveThreshold(
        img_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # (Optional) Additional steps such as deskewing can be added here
    return img_thresh

# Save the preprocessed image to disk (doctr currently requires image file inputs)
def save_preprocessed_image(img, output_path):
    cv2.imwrite(output_path, img)

# Step 2: Extract text using doctr-ocr
def extract_text_from_document(image_path):
    # Preprocess the image
    preprocessed_img = preprocess_image(image_path)
    temp_path = "temp_preprocessed.jpg"
    save_preprocessed_image(preprocessed_img, temp_path)
    
    # Load the document with doctr
    doc = DocumentFile.from_images([temp_path])
    
    # Initialize the OCR model (using pretrained weights)
    model = ocr_predictor(pretrained=True)
    
    # Run OCR on the document
    result = model(doc)
    
    # Export the OCR result as a JSON structure
    result_json = result.export()
    return result_json

# Step 3: Post-process the OCR output to extract specific fields
def parse_document_data(result_json):
    # Combine all recognized text from the OCR output
    all_text = ""
    for page in result_json.get("pages", []):
        for block in page.get("blocks", []):
            for line in block.get("lines", []):
                all_text += " " + line.get("text", "")
    all_text = all_text.strip()
    
    # Use regex patterns to extract specific fields:
    # PAN number: typically 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    pan_pattern = r"[A-Z]{5}[0-9]{4}[A-Z]"
    pan_number = re.findall(pan_pattern, all_text)
    
    # Aadhaar number: usually written as 4 digits space 4 digits space 4 digits (e.g., 1234 5678 9012)
    aadhaar_pattern = r"\b\d{4}\s\d{4}\s\d{4}\b"
    aadhaar_number = re.findall(aadhaar_pattern, all_text)
    
    # Passport number: in India, often an 8-character string starting with a letter (example pattern)
    passport_pattern = r"[A-Z][0-9]{7}"
    passport_number = re.findall(passport_pattern, all_text)
    
    # Build a structured dictionary from the extracted text
    structured_data = {
        "full_text": all_text,
        "pan_number": pan_number[0] if pan_number else None,
        "aadhaar_number": aadhaar_number[0] if aadhaar_number else None,
        "passport_number": passport_number[0] if passport_number else None,
    }
    return structured_data

def main():
    image_path = "./dataset/adhar1.1.jpeg"  # Replace with your document image file path (e.g., Aadhaar, PAN, Passport)
    
    # Extract OCR results as JSON
    ocr_result_json = extract_text_from_document(image_path)
    
    # Parse the OCR output to extract structured fields
    structured_data = parse_document_data(ocr_result_json)
    
    # Print the structured data in JSON format
    print(json.dumps(structured_data, indent=4))

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test script to verify Tesseract OCR installation and functionality
"""

import sys
import subprocess
import os
from PIL import Image, ImageDraw, ImageFont
import pytesseract
import tempfile

def test_tesseract_installation():
    """Test if Tesseract is properly installed"""
    print("Testing Tesseract OCR installation...")
    
    # Test 1: Check if tesseract command exists
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✓ Tesseract command found")
            print(f"  Version: {result.stdout.split()[1]}")
        else:
            print("✗ Tesseract command failed")
            return False
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        print("✗ Tesseract command not found")
        
        # Try to find Tesseract in common locations
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            '/usr/bin/tesseract',
            '/usr/local/bin/tesseract',
            '/opt/homebrew/bin/tesseract',
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                print(f"  Found Tesseract at: {path}")
                pytesseract.pytesseract.tesseract_cmd = path
                try:
                    result = subprocess.run([path, '--version'], 
                                          capture_output=True, text=True, timeout=10)
                    if result.returncode == 0:
                        print(f"  ✓ Tesseract working at {path}")
                        print(f"    Version: {result.stdout.split()[1]}")
                        break
                except Exception as e:
                    print(f"  ✗ Tesseract at {path} not working: {e}")
                    continue
        else:
            print("  ✗ Tesseract not found in common locations")
            return False
    
    # Test 2: Test pytesseract
    try:
        print("\nTesting pytesseract...")
        
        # Create a test image with text
        img = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fallback to default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.text((10, 30), "Hello World Test", fill='black', font=font)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            img.save(temp_file.name, 'PNG')
            temp_path = temp_file.name
        
        # Test OCR
        text = pytesseract.image_to_string(img, lang='eng')
        print(f"  OCR Result: '{text.strip()}'")
        
        # Clean up
        os.unlink(temp_path)
        
        if 'Hello' in text or 'World' in text:
            print("  ✓ pytesseract working correctly")
            return True
        else:
            print("  ✗ pytesseract not recognizing text properly")
            return False
            
    except Exception as e:
        print(f"  ✗ pytesseract test failed: {e}")
        return False

def test_with_sample_image():
    """Test with a more complex sample image"""
    print("\nTesting with sample text image...")
    
    # Create a more complex test image
    img = Image.new('RGB', (600, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    sample_text = [
        "This is a test document.",
        "It contains multiple lines of text.",
        "Numbers: 123, 456, 789",
        "Special chars: @#$%^&*()"
    ]
    
    y_offset = 20
    for line in sample_text:
        draw.text((20, y_offset), line, fill='black', font=font)
        y_offset += 30
    
    # Test OCR
    try:
        text = pytesseract.image_to_string(img, lang='eng')
        print(f"OCR Result:\n{text}")
        
        # Check if key words are recognized
        recognized_words = []
        test_words = ['test', 'document', 'multiple', 'lines', '123']
        
        for word in test_words:
            if word in text.lower():
                recognized_words.append(word)
        
        print(f"Recognized words: {recognized_words}")
        
        if len(recognized_words) >= 3:
            print("✓ OCR working well with complex text")
            return True
        else:
            print("✗ OCR struggling with complex text")
            return False
            
    except Exception as e:
        print(f"✗ Complex OCR test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Tesseract OCR Installation Test")
    print("=" * 40)
    
    if not test_tesseract_installation():
        print("\n❌ Tesseract installation test failed!")
        print("\nInstallation instructions:")
        print("Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        print("Linux: sudo apt-get install tesseract-ocr")
        print("macOS: brew install tesseract")
        sys.exit(1)
    
    if not test_with_sample_image():
        print("\n⚠️  Basic installation works but OCR quality may be poor")
    else:
        print("\n✅ Tesseract OCR is working correctly!")
    
    print("\nYou can now use the Flask application with OCR support.")

if __name__ == "__main__":
    main()
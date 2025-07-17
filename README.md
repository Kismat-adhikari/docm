# StudyPasa - AI-Powered Study Assistant

StudyPasa is an intelligent web application that transforms your study materials into interactive learning content. Upload documents, images, or presentations, and get automatically generated multiple-choice questions (MCQs) and flashcards powered by AI.

## 🌟 Features

### 📄 Document Processing
- **Multi-format support**: PDF, DOCX, PPTX, PNG, JPG, JPEG, TIFF, BMP
- **Advanced text extraction**: Uses OCR for image-based content
- **Smart preprocessing**: Enhances images for better text recognition

### 🧠 AI-Powered Content Generation
- **MCQ Generation**: Creates contextual multiple-choice questions from your content
- **Flashcard Creation**: Generates question-answer pairs for effective memorization
- **GROQ API Integration**: Uses Llama3-8B model for high-quality question generation

### 💾 Session-Based Storage
- **Temporary storage**: MCQs and flashcards stored in user sessions
- **Per-user isolation**: Each user gets their own isolated data
- **Automatic cleanup**: Data cleared when browser session ends
- **Cross-page persistence**: Access generated content across different pages

### 🎯 Interactive Learning
- **Real-time feedback**: Immediate answer validation
- **Score tracking**: Monitor your quiz performance
- **Flip-card flashcards**: Interactive learning interface
- **QuizPasa Chatbot**: AI study assistant for additional help

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Tesseract OCR installed on your system
- GROQ API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studypasa.git
cd studypasa
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Tesseract OCR**
   - **Windows**: Download from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
   - **Linux**: `sudo apt-get install tesseract-ocr`
   - **macOS**: `brew install tesseract`

4. **Set up environment variables**
```bash
# Create .env file
touch .env

# Add your GROQ API key
echo "GROQ_API_KEY=your_groq_api_key_here" >> .env
```

5. **Run the application**
```bash
python app.py
```

6. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## 📊 Session Storage Architecture

### How Session Storage Works

StudyPasa uses Flask's built-in session management for temporary data storage:

```python
# Data Storage Process
session['mcqs'] = mcqs           # List of generated MCQs
session['flashcards'] = flashcards   # List of generated flashcards  
session['filename'] = filename       # Original filename
```

### Session Lifecycle

```
User uploads file → AI generates content → Store in session → Browser gets encrypted cookie
                                               ↓
User visits pages → Browser sends cookie → Flask decrypts → Access stored data
                                               ↓
User closes browser → Cookie expires → Session data automatically cleared
```

### Session Data Structure

```json
{
  "mcqs": [
    {
      "question": "What is the main concept discussed?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0
    }
  ],
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ],
  "filename": "uploaded_document.pdf"
}
```

## 🔧 API Endpoints

### Core Routes
- `GET /` - Main homepage
- `GET /upload` - Upload form
- `POST /upload` - Process uploaded files
- `POST /check_answer` - Validate quiz answers

### Session Management
- `GET /session_data` - Retrieve current session's MCQs and flashcards
- `GET /clear_session` - Clear all session data
- `POST /quizpasa_chat` - Chatbot interaction

### Testing Session Storage
```bash
# Check session contents
curl http://localhost:5000/session_data

# Clear session
curl http://localhost:5000/clear_session
```

## 🏗️ Project Structure

```
studypasa/
├── app.py                 # Main Flask application
├── quizpasa.py           # Chatbot functionality
├── templates/
│   ├── index.html        # Homepage
│   ├── upload.html       # File upload page
│   └── quiz.html         # Quiz and flashcard interface
├── static/
│   ├── style.css         # Application styling
│   ├── script.js         # Frontend JavaScript
│   └── images/           # Static images
├── uploads/              # Temporary file storage
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 📋 Dependencies

### Core Libraries
- **Flask**: Web framework
- **python-dotenv**: Environment variable management
- **requests**: HTTP requests for API calls

### Document Processing
- **pdfplumber**: PDF text extraction
- **python-docx**: DOCX file processing
- **python-pptx**: PPTX file processing
- **PyMuPDF (fitz)**: Advanced PDF image extraction

### OCR and Image Processing
- **pytesseract**: OCR text recognition
- **pdf2image**: PDF to image conversion
- **Pillow (PIL)**: Image processing and enhancement

### AI Integration
- **GROQ API**: AI-powered content generation

## 🔐 Session Security

### Security Features
- **Encrypted cookies**: All session data encrypted with SECRET_KEY
- **Signed sessions**: Prevents tampering with session data
- **Automatic expiration**: Sessions expire when browser closes
- **Per-user isolation**: Each user gets completely separate session storage

### Session Configuration
```python
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'studypasa:'
```

## 🧪 Testing Session Storage

### Method 1: Debug Console
Monitor console output during file upload for session storage confirmation.

### Method 2: API Testing
```bash
# Upload a file, then check session
curl http://localhost:5000/session_data

# Expected response:
{
  "success": true,
  "mcqs": [...],
  "flashcards": [...],
  "filename": "your_file.pdf",
  "mcq_count": 10,
  "flashcard_count": 10
}
```

### Method 3: Multi-tab Testing
1. Upload file in Tab 1
2. Open Tab 2 to `/session_data`
3. Verify same data appears (confirms session persistence)

## 🎯 Usage Examples

### Basic Workflow
1. **Upload Document**: Choose PDF, DOCX, PPTX, or image file
2. **AI Processing**: System extracts text and generates content
3. **Session Storage**: MCQs and flashcards stored temporarily
4. **Interactive Learning**: Take quiz and study with flashcards
5. **Session Cleanup**: Data automatically cleared when done

### Advanced Features
- **OCR Processing**: Handles image-based documents and scanned PDFs
- **Fallback Generation**: Works even without API key using content-based generation
- **Multi-format Support**: Processes various document types seamlessly

## 🚨 Troubleshooting

### Common Issues

**Tesseract Not Found**
```bash
# Install Tesseract OCR
# Windows: Download from GitHub releases
# Linux: sudo apt-get install tesseract-ocr
# macOS: brew install tesseract
```

**Session Data Not Persisting**
- Check if `SECRET_KEY` is set in Flask config
- Verify browser accepts cookies
- Ensure session configuration is correct

**OCR Quality Issues**
- Use high-resolution images (300 DPI recommended)
- Ensure good contrast and clear text
- Try different image formats (PNG often works best)

## 📈 Performance Considerations

### Session Storage Limits
- **Cookie size limit**: ~4KB per cookie
- **Large datasets**: Consider pagination for many questions
- **Memory usage**: Sessions stored in server memory

### Optimization Tips
- Clear unused sessions regularly
- Implement session timeout for inactive users
- Monitor memory usage with multiple concurrent users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **GROQ**: For providing AI-powered content generation
- **Tesseract**: For OCR capabilities
- **Flask**: For the excellent web framework
- **Community**: For various open-source libraries used

---

**Happy Studying with StudyPasa! 🎓**
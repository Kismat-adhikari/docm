// Initialize quiz variables
let score = 0;
const totalQuestions = parseInt('{{ mcqs|length }}');
const answeredQuestions = new Set();

// Initialize QuizPasa chatbot variables
let quizPasaConversationHistory = [];
let quizPasaIsOpen = false;

// Quiz functionality
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const questionCard = this.closest('.question-card');
        const questionIndex = parseInt(questionCard.dataset.questionIndex);
        const selectedOption = parseInt(this.dataset.optionIndex);
        const correctAnswer = parseInt(this.dataset.correctAnswer);
        
        // Prevent multiple answers for the same question
        if (answeredQuestions.has(questionIndex)) {
            return;
        }
        
        // Mark question as answered
        answeredQuestions.add(questionIndex);
        
        // Disable all options in this question
        questionCard.querySelectorAll('.option-btn').forEach(option => {
            option.disabled = true;
        });
        
        // Show feedback
        const isCorrect = selectedOption === correctAnswer;
        showFeedback(questionCard, isCorrect, correctAnswer);
        
        // Update score
        if (isCorrect) {
            score++;
            this.classList.add('correct');
        } else {
            this.classList.add('incorrect');
            // Highlight correct answer
            questionCard.querySelectorAll('.option-btn')[correctAnswer].classList.add('correct');
        }
        
        // Update score display
        document.getElementById('score').textContent = score;
    });
});

function showFeedback(questionCard, isCorrect, correctAnswer) {
    const feedback = questionCard.querySelector('.feedback');
    const feedbackIcon = feedback.querySelector('.feedback-icon');
    const feedbackText = feedback.querySelector('.feedback-text');
    
    if (isCorrect) {
        feedbackIcon.textContent = '✅';
        feedbackText.textContent = 'Correct!';
        feedback.className = 'feedback correct';
    } else {
        feedbackIcon.textContent = '❌';
        feedbackText.textContent = `Wrong! The correct answer is ${['A', 'B', 'C', 'D'][correctAnswer]}.`;
        feedback.className = 'feedback incorrect';
    }
    
    feedback.style.display = 'block';
}

function resetQuiz() {
    score = 0;
    answeredQuestions.clear();
    document.getElementById('score').textContent = '0';
    
    // Reset all question cards
    document.querySelectorAll('.question-card').forEach(card => {
        // Re-enable all options
        card.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
        
        // Hide feedback
        card.querySelector('.feedback').style.display = 'none';
    });
}

// QuizPasa Chatbot functionality
function toggleQuizPasa() {
    const chatbox = document.getElementById('quizpasa-chatbox');
    const isVisible = chatbox.style.display === 'flex';
    
    if (isVisible) {
        closeQuizPasa();
    } else {
        openQuizPasa();
    }
}

function openQuizPasa() {
    const chatbox = document.getElementById('quizpasa-chatbox');
    chatbox.style.display = 'flex';
    quizPasaIsOpen = true;
    
    // Focus on input
    document.getElementById('quizpasa-input').focus();
    
    // Add welcome message if this is the first time opening
    if (quizPasaConversationHistory.length === 0) {
        addQuizPasaMessage('Hi! I\'m QuizPasa, your friendly study assistant! 🎓\n\nI\'m here to help you with:\n• Study techniques and tips\n• Understanding your MCQs and flashcards\n• Learning strategies\n• Academic questions\n\nWhat would you like to know?', 'bot');
    }
}

function closeQuizPasa() {
    const chatbox = document.getElementById('quizpasa-chatbox');
    chatbox.style.display = 'none';
    quizPasaIsOpen = false;
}

function handleQuizPasaKeyPress(event) {
    if (event.key === 'Enter') {
        sendQuizPasaMessage();
    }
}

function addQuizPasaMessage(text, sender) {
    const messagesContainer = document.getElementById('quizpasa-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `quizpasa-message ${sender}`;
    messageDiv.textContent = text;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store in conversation history
    quizPasaConversationHistory.push({
        role: sender === 'user' ? 'user' : 'assistant',
        content: text
    });
    
    // Keep only last 10 messages to prevent memory issues
    if (quizPasaConversationHistory.length > 10) {
        quizPasaConversationHistory = quizPasaConversationHistory.slice(-10);
    }
}

function showQuizPasaTyping() {
    const messagesContainer = document.getElementById('quizpasa-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'quizpasa-typing';
    typingDiv.id = 'quizpasa-typing-indicator';
    typingDiv.innerHTML = `
        QuizPasa is typing...
        <div class="quizpasa-typing-dots">
            <div class="quizpasa-typing-dot"></div>
            <div class="quizpasa-typing-dot"></div>
            <div class="quizpasa-typing-dot"></div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return typingDiv;
}

function hideQuizPasaTyping() {
    const typingDiv = document.getElementById('quizpasa-typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

async function sendQuizPasaMessage() {
    const input = document.getElementById('quizpasa-input');
    const sendButton = document.querySelector('.quizpasa-send');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addQuizPasaMessage(message, 'user');
    
    // Clear input and disable send button
    input.value = '';
    sendButton.disabled = true;
    
    // Show typing indicator
    const typingIndicator = showQuizPasaTyping();
    
    try {
        const response = await fetch('/quizpasa_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: quizPasaConversationHistory.slice(-8) // Send last 8 messages for context
            })
        });
        
        const data = await response.json();
        
        // Hide typing indicator
        hideQuizPasaTyping();
        
        if (data.success) {
            addQuizPasaMessage(data.message, 'bot');
        } else {
            addQuizPasaMessage(data.message || 'Sorry, I encountered an error. Please try again!', 'bot');
        }
        
    } catch (error) {
        console.error('QuizPasa error:', error);
        hideQuizPasaTyping();
        addQuizPasaMessage('Sorry, I\'m having trouble connecting right now. Please try again!', 'bot');
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
        input.focus();
    }
}

// DOM Content Loaded - Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to mascot
    const mascot = document.getElementById('quizpasa-mascot');
    if (mascot) {
        mascot.addEventListener('click', toggleQuizPasa);
    }
    
    // Add click event listener to close button
    const closeButton = document.getElementById('quizpasa-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeQuizPasa);
    }
    
    // Add keypress event listener to input
    const input = document.getElementById('quizpasa-input');
    if (input) {
        input.addEventListener('keypress', handleQuizPasaKeyPress);
    }
    
    // Add click event listener to send button
    const sendButton = document.getElementById('quizpasa-send');
    if (sendButton) {
        sendButton.addEventListener('click', sendQuizPasaMessage);
    }
});

// Close chatbox when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.quizpasa-container');
    const chatbox = document.getElementById('quizpasa-chatbox');
    
    if (quizPasaIsOpen && !container.contains(event.target)) {
        closeQuizPasa();
    }
});
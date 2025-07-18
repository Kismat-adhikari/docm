// Initialize quiz variables
        let studyPasaScore = 0;
        const studyPasaTotalQuestions = parseInt('{{ mcqs|length }}');
        const studyPasaAnsweredQuestions = new Set();

        let studyPasaSeenFlashcards = new Set();

        // Initialize Assistant chatbot variables
        let studyPasaConversationHistory = [];
        let studyPasaAssistantOpen = false;

        // Quiz functionality
        document.querySelectorAll('.studypasa-option-button').forEach(btn => {
            btn.addEventListener('click', function() {
                const questionCard = this.closest('.studypasa-question-item');
                const questionIndex = parseInt(questionCard.dataset.questionIndex);
                const selectedOption = parseInt(this.dataset.optionIndex);
                const correctAnswer = parseInt(this.dataset.correctAnswer);
                
                // Prevent multiple answers for the same question
                if (studyPasaAnsweredQuestions.has(questionIndex)) {
                    return;
                }
                
                // Mark question as answered
                studyPasaAnsweredQuestions.add(questionIndex);
                
                // Disable all options in this question
                questionCard.querySelectorAll('.studypasa-option-button').forEach(option => {
                    option.disabled = true;
                });
                
                // Show feedback
                const isCorrect = selectedOption === correctAnswer;
                showStudyPasaFeedback(questionCard, isCorrect, correctAnswer);
                
                // Update score
                if (isCorrect) {
                    studyPasaScore++;
                    this.classList.add('studypasa-correct-answer');
                } else {
                    this.classList.add('studypasa-wrong-answer');
                    // Highlight correct answer
                    questionCard.querySelectorAll('.studypasa-option-button')[correctAnswer].classList.add('studypasa-correct-answer');
                }
                
                // Update score display
                document.getElementById('studypasa-score-counter').textContent = studyPasaScore;
            });
        });

        function showStudyPasaFeedback(questionCard, isCorrect, correctAnswer) {
            const feedback = questionCard.querySelector('.studypasa-answer-feedback');
            const feedbackIcon = feedback.querySelector('.studypasa-feedback-icon');
            const feedbackText = feedback.querySelector('.studypasa-feedback-text');
            
            if (isCorrect) {
                feedbackIcon.textContent = '✅';
                feedbackText.textContent = 'Correct!';
                feedback.className = 'studypasa-answer-feedback studypasa-correct-feedback';
            } else {
                feedbackIcon.textContent = '❌';
                feedbackText.textContent = `Wrong! The correct answer is ${['A', 'B', 'C', 'D'][correctAnswer]}.`;
                feedback.className = 'studypasa-answer-feedback studypasa-incorrect-feedback';
            }
            
            feedback.style.display = 'block';
        }

        function resetStudyPasaQuiz() {
            studyPasaScore = 0;
            studyPasaAnsweredQuestions.clear();
            document.getElementById('studypasa-score-counter').textContent = '0';
            studyPasaSeenFlashcards.clear();
            document.getElementById('studypasa-seen-counter').textContent = '0';

            
            // Reset all question cards
            document.querySelectorAll('.studypasa-question-item').forEach(card => {
                // Re-enable all options
                card.querySelectorAll('.studypasa-option-button').forEach(btn => {
                    btn.disabled = false;
                    btn.classList.remove('studypasa-correct-answer', 'studypasa-wrong-answer');
                });
                
                // Hide feedback
                card.querySelector('.studypasa-answer-feedback').style.display = 'none';
            });
        }

        // Assistant Chatbot functionality
        function toggleStudyPasaAssistant() {
            const panel = document.getElementById('studypasa-assistant-panel');
            
            if (studyPasaAssistantOpen) {
                closeStudyPasaAssistant();
            } else {
                openStudyPasaAssistant();
            }
        }

        function openStudyPasaAssistant() {
            const panel = document.getElementById('studypasa-assistant-panel');
            panel.classList.add('studypasa-panel-active');
            studyPasaAssistantOpen = true;
            
            // Focus on input
            document.getElementById('studypasa-message-input').focus();
            
            // Add welcome message if this is the first time opening
            if (studyPasaConversationHistory.length === 0) {
                addStudyPasaMessage('Hi! I\'m QuizPasa, your friendly study assistant! 🎓\n\nI\'m here to help you with:\n• Study techniques and tips\n• Understanding your MCQs and flashcards\n• Learning strategies\n• Academic questions\n\nWhat would you like to know?', 'bot');
            }
        }

        function closeStudyPasaAssistant() {
            const panel = document.getElementById('studypasa-assistant-panel');
            panel.classList.remove('studypasa-panel-active');
            studyPasaAssistantOpen = false;
        }

        function handleStudyPasaKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendStudyPasaMessage();
            }
        }

        function addStudyPasaMessage(text, sender) {
            const messagesContainer = document.getElementById('studypasa-conversation-area');
            const messageDiv = document.createElement('div');
            messageDiv.className = `studypasa-message-bubble studypasa-${sender}-message`;
            messageDiv.textContent = text;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Store in conversation history
            studyPasaConversationHistory.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: text
            });
            
            // Keep only last 10 messages to prevent memory issues
            if (studyPasaConversationHistory.length > 10) {
                studyPasaConversationHistory = studyPasaConversationHistory.slice(-10);
            }
        }

        function showStudyPasaTyping() {
            const messagesContainer = document.getElementById('studypasa-conversation-area');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'studypasa-typing-indicator';
            typingDiv.id = 'studypasa-typing-indicator';
            typingDiv.innerHTML = `
                QuizPasa is typing...
                <div class="studypasa-typing-dots">
                    <div class="studypasa-typing-dot"></div>
                    <div class="studypasa-typing-dot"></div>
                    <div class="studypasa-typing-dot"></div>
                </div>
            `;
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return typingDiv;
        }

        function hideStudyPasaTyping() {
            const typingDiv = document.getElementById('studypasa-typing-indicator');
            if (typingDiv) {
                typingDiv.remove();
            }
        }

        async function sendStudyPasaMessage() {
            const input = document.getElementById('studypasa-message-input');
            const sendButton = document.getElementById('studypasa-send-button');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            addStudyPasaMessage(message, 'user');
            
            // Clear input and disable send button
            input.value = '';
            sendButton.disabled = true;
            
            // Show typing indicator
            const typingIndicator = showStudyPasaTyping();
            
            try {
                const response = await fetch('/quizpasa_chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        conversation_history: studyPasaConversationHistory
                    })
                });
                
                const data = await response.json();
                
                // Hide typing indicator
                hideStudyPasaTyping();
                
                if (data.success) {
                    addStudyPasaMessage(data.message, 'bot');
                } else {
                    addStudyPasaMessage(data.message || 'Sorry, I encountered an error. Please try again!', 'bot');
                }
                
            } catch (error) {
                console.error('QuizPasa error:', error);
                hideStudyPasaTyping();
                addStudyPasaMessage('Sorry, I\'m having trouble connecting right now. Please try again!', 'bot');
            } finally {
                // Re-enable send button
                sendButton.disabled = false;
                input.focus();
            }
        }

        function toggleFlashcard(flashcardElement, indexStr) {
            const index = parseInt(indexStr);
            flashcardElement.classList.toggle('studypasa-flipped');
            if (!studyPasaSeenFlashcards.has(index)) {
                studyPasaSeenFlashcards.add(index);
                document.getElementById('studypasa-seen-counter').textContent = studyPasaSeenFlashcards.size;
            }
        }

        // DOM Content Loaded - Set up event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Add click event listener to trigger button
            const trigger = document.getElementById('studypasa-assistant-trigger');
            if (trigger) {
                trigger.addEventListener('click', toggleStudyPasaAssistant);
            }
            
            // Add click event listener to close button
            const closeButton = document.getElementById('studypasa-assistant-close');
            if (closeButton) {
                closeButton.addEventListener('click', closeStudyPasaAssistant);
            }
            
            // Add keypress event listener to input
            const input = document.getElementById('studypasa-message-input');
            if (input) {
                input.addEventListener('keypress', handleStudyPasaKeyPress);
            }
            
            // Add click event listener to send button
            const sendButton = document.getElementById('studypasa-send-button');
            if (sendButton) {
                sendButton.addEventListener('click', sendStudyPasaMessage);
            }

            // Auto-open the assistant when page loads
            setTimeout(() => {
                openStudyPasaAssistant();
            }, 1000); // 1 second delay for better UX
        });

        // Close assistant when clicking outside
        document.addEventListener('click', function(event) {
            const container = document.querySelector('.studypasa-assistant-container');
            const panel = document.getElementById('studypasa-assistant-panel');
            
            if (studyPasaAssistantOpen && !container.contains(event.target)) {
                closeStudyPasaAssistant();
            }
        });
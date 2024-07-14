// Full-Featured Interactive Story Creator
// Includes all original features with improved error handling and structure

document.addEventListener('DOMContentLoaded', function() {
    // Load data from local storage
    function loadFromLocalStorage() {
        const savedStoryParts = localStorage.getItem('storyParts');
        const savedCurrentPart = localStorage.getItem('currentPart');
        const savedHistory = localStorage.getItem('history');

        if (savedStoryParts) {
            storyParts = JSON.parse(savedStoryParts);
        }
        if (savedCurrentPart) {
            currentPart = parseInt(savedCurrentPart, 10);
        }
        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }
    }

    // Save data to local storage
    function saveToLocalStorage() {
        localStorage.setItem('storyParts', JSON.stringify(storyParts));
        localStorage.setItem('currentPart', currentPart.toString());
        localStorage.setItem('history', JSON.stringify(history));
    }
    // DOM Elements
    const elements = {
        modeToggle: document.getElementById('mode-toggle'),
        creatorMode: document.getElementById('creator-mode'),
        playerMode: document.getElementById('player-mode'),
        storyStructure: document.getElementById('story-structure'),
        addPartBtn: document.getElementById('add-part-btn'),
        saveBtn: document.getElementById('save-btn'),
        storyText: document.getElementById('story-text'),
        choicesContainer: document.getElementById('choices'),
        progressBar: document.getElementById('progress'),
        progressText: document.getElementById('progress-text'),
        finalStory: document.getElementById('final-story'),
        historyText: document.getElementById('history-text'),
        resetBtn: document.getElementById('reset-btn'),
        loadBtn: document.getElementById('load-btn'),
        fileInput: document.getElementById('file-input'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        toggleProgressBtn: document.getElementById('toggle-progress'),
        progressContainer: document.getElementById('progress-container'),
        replayBtn: document.getElementById('replay-story'),
        content: document.querySelector('.content'),
        authorLink: document.getElementById('author-link'),
        authorPreview: document.getElementById('author-preview')
    };

    // Null check for elements
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
        }
    }

    // State
    let storyParts = [{ name: 'Part 1', text: '', choices: [] }];
    let currentPart = 0;
    let history = [];

    // Functions
    function isPartNameDuplicate(newName, currentPartIndex) {
        return storyParts.some((part, index) => 
            part.name.toLowerCase() === newName.toLowerCase() && index !== currentPartIndex
        );
    }

    function updateStoryStructure() {
        if (!elements.storyStructure) return;

        elements.storyStructure.innerHTML = storyParts.map((part, index) => `
            <div class="story-part">
                <h3>
                    <span class="part-name">${part.name}</span>
                    <button class="edit-part-name" data-part="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </h3>
                <textarea class="part-text" placeholder="Enter your story part here...">${part.text}</textarea>
                <div class="choices">
                    ${part.choices.map((choice, choiceIndex) => `
                        <div class="choice">
                            <input type="text" class="choice-input" placeholder="Enter choice text" value="${choice.text}" data-part="${index}" data-choice="${choiceIndex}">
                            <select class="next-part-select" data-part="${index}" data-choice="${choiceIndex}">
                                ${storyParts.map((_, i) => `<option value="${i}" ${i === choice.nextPart ? 'selected' : ''}>${storyParts[i].name}</option>`).join('')}
                            </select>
                            <button class="remove-choice-btn btn" data-part="${index}" data-choice="${choiceIndex}">Remove Choice</button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-choice-btn btn" data-part="${index}">Add Choice</button>
                <button class="remove-part-btn btn" data-part="${index}">Remove Part</button>
            </div>
        `).join('');

        addStoryPartEventListeners();
        saveToLocalStorage();
    }

    function addStoryPartEventListeners() {
        document.querySelectorAll('.part-text').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const partIndex = Array.from(elements.storyStructure.children).indexOf(e.target.closest('.story-part'));
                storyParts[partIndex].text = e.target.value;
                saveToLocalStorage();
            });
        });

        document.querySelectorAll('.add-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partIndex = parseInt(e.target.dataset.part);
                storyParts[partIndex].choices.push({ text: '', nextPart: partIndex });
                updateStoryStructure();
            });
        });

        document.querySelectorAll('.choice-input, .next-part-select').forEach(element => {
            element.addEventListener('input', (e) => {
                const partIndex = parseInt(e.target.dataset.part);
                const choiceIndex = parseInt(e.target.dataset.choice);
                if (e.target.classList.contains('choice-input')) {
                    storyParts[partIndex].choices[choiceIndex].text = e.target.value;
                } else {
                    storyParts[partIndex].choices[choiceIndex].nextPart = parseInt(e.target.value);
                }
                saveToLocalStorage();
            });
        });

        document.querySelectorAll('.remove-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partIndex = parseInt(e.target.dataset.part);
                const choiceIndex = parseInt(e.target.dataset.choice);
                storyParts[partIndex].choices.splice(choiceIndex, 1);
                updateStoryStructure();
            });
        });

        document.querySelectorAll('.remove-part-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partIndex = parseInt(e.target.dataset.part);
                storyParts.splice(partIndex, 1);
                updateStoryStructure();
            });
        });

        document.querySelectorAll('.edit-part-name').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partIndex = parseInt(e.currentTarget.dataset.part);
                const currentName = storyParts[partIndex].name;
                let newName = prompt('Enter new name for this part:', currentName);
                
                if (newName && newName !== currentName) {
                    if (isPartNameDuplicate(newName, partIndex)) {
                        alert('A part with this name already exists. Please choose a different name.');
                    } else {
                        storyParts[partIndex].name = newName;
                        updateStoryStructure();
                    }
                }
            });
        });
    }

    function saveStory() {
        const storyData = JSON.stringify(storyParts);
        const blob = new Blob([storyData], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function resetStory() {
        if (confirm('Are you sure you want to reset the story? This action cannot be undone.')) {
            storyParts = [{ name: 'Part 1', text: '', choices: [] }];
            currentPart = 0;
            history = [];
            updateStoryStructure();
            updateStory();
            localStorage.clear();
        }
    }

    function loadStory(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    storyParts = JSON.parse(e.target.result);
                    updateStoryStructure();
                    resetPlayMode();
                    saveToLocalStorage();
                    alert('Story loaded successfully!');
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Invalid file format. Please select a valid JSON file.');
                }
            };
            reader.readAsText(file);
        }
    }

    function toggleProgress() {
        if (elements.progressContainer) {
            elements.progressContainer.style.display = elements.progressContainer.style.display === 'none' ? 'block' : 'none';
            elements.toggleProgressBtn.textContent = elements.progressContainer.style.display === 'none' ? 'Show Progress' : 'Hide Progress';
        }
    }

    function resetPlayMode() {
        currentPart = 0;
        history = [];
        updateStory();
        updateHistory();
        if (elements.progressBar) elements.progressBar.style.width = '0%';
        if (elements.progressText) elements.progressText.textContent = 'Part 1';
        if (elements.finalStory) elements.finalStory.style.display = 'none';
        if (elements.storyText) elements.storyText.style.display = 'block';
        if (elements.choicesContainer) elements.choicesContainer.style.display = 'block';
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        if (elements.darkModeToggle) elements.darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }

    function updateStory() {
        if (!elements.storyText || !elements.choicesContainer) return;

        const part = storyParts[currentPart];
        elements.storyText.textContent = part.text;
        elements.choicesContainer.innerHTML = part.choices.map((choice, index) => `
            <button class="choice-btn" data-index="${index}">${choice.text}</button>
        `).join('');

        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choiceIndex = parseInt(e.target.dataset.index);
                const choice = part.choices[choiceIndex];
                
                // Error handling for loops and unassigned parts
                if (choice.nextPart === currentPart) {
                    alert('This choice leads back to the same part. Please assign a different next part to avoid loops.');
                    return;
                } else if (choice.nextPart >= storyParts.length) {
                    alert('This choice leads to a non-existent part. Please create the next part or assign a valid existing part.');
                    return;
                }

                history.push({ part: currentPart, choice: choiceIndex });
                currentPart = choice.nextPart;
                updateStory();
                updateHistory();
                updateProgress();
            });
        });

        if (part.choices.length === 0) {
            if (elements.finalStory) {
                elements.finalStory.style.display = 'block';
                elements.finalStory.textContent = history.map(h => storyParts[h.part].text).join('\n\n');
            }
        } else {
            if (elements.finalStory) elements.finalStory.style.display = 'none';
        }
    }

    function updateHistory() {
        if (!elements.historyText) return;
        elements.historyText.innerHTML = history.map((h, index) => `
            <p>
                <strong>Part ${index + 1}:</strong> ${storyParts[h.part].text}<br>
                <em>Choice: ${storyParts[h.part].choices[h.choice].text}</em>
            </p>
        `).join('');
    }

    function updateProgress() {
        if (!elements.progressBar || !elements.progressText) return;
        const progress = (currentPart + 1) / storyParts.length;
        elements.progressBar.style.width = `${progress * 100}%`;
        elements.progressText.textContent = `Part ${currentPart + 1} of ${storyParts.length}`;
    }

    // Event Listeners
    if (elements.modeToggle) {
        elements.modeToggle.addEventListener('click', () => {
            elements.creatorMode.classList.toggle('hidden');
            elements.playerMode.classList.toggle('hidden');
            elements.modeToggle.textContent = elements.creatorMode.classList.contains('hidden') ? 'Switch to Creator Mode' : 'Switch to Play Mode';
            if (!elements.creatorMode.classList.contains('hidden')) {
                updateStoryStructure();
            } else {
                resetPlayMode();
            }
        });
    }

    if (elements.addPartBtn) {
        elements.addPartBtn.addEventListener('click', () => {
            const newPartNumber = storyParts.length + 1;
            storyParts.push({ name: `Part ${newPartNumber}`, text: '', choices: [] });
            updateStoryStructure();
        });
    }

    if (elements.saveBtn) elements.saveBtn.addEventListener('click', saveStory);
    if (elements.resetBtn) elements.resetBtn.addEventListener('click', resetStory);
    if (elements.loadBtn) elements.loadBtn.addEventListener('click', () => elements.fileInput.click());
    if (elements.fileInput) elements.fileInput.addEventListener('change', loadStory);
    if (elements.toggleProgressBtn) elements.toggleProgressBtn.addEventListener('click', toggleProgress);
    if (elements.replayBtn) elements.replayBtn.addEventListener('click', resetPlayMode);
    if (elements.darkModeToggle) elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // Mouse tracking for darkening effect
    if (elements.content) {
        elements.content.addEventListener('mousemove', (e) => {
            const rect = elements.content.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            elements.content.style.setProperty('--mouse-x', `${x}px`);
            elements.content.style.setProperty('--mouse-y', `${y}px`);
        });
    }

    // Author preview functionality
    if (elements.authorLink && elements.authorPreview) {
        elements.authorLink.addEventListener('mouseenter', function() {
            elements.authorPreview.classList.add('show');
        });

        elements.authorLink.addEventListener('mouseleave', function() {
            elements.authorPreview.classList.remove('show');
        });
    }
        // Initialize
        loadFromLocalStorage();
        updateStoryStructure();
        updateStory();

    // Initialize
    updateStoryStructure();
    updateStory();

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (elements.darkModeToggle) elements.darkModeToggle.textContent = '☀️';
    }
});
// Add this to your existing script.js file

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Function to update menu options
    function updateMenuOptions() {
      if (document.body.classList.contains('dark-mode')) {
        if (!document.getElementById('disable-darkening')) {
          const disableDarkeningOption = document.createElement('a');
          disableDarkeningOption.href = '#';
          disableDarkeningOption.id = 'disable-darkening';
          disableDarkeningOption.className = 'menu-button';
          disableDarkeningOption.textContent = 'Disable Mouse Darkening';
          dropdownMenu.appendChild(disableDarkeningOption);
  
          const highContrastOption = document.createElement('a');
          highContrastOption.href = '#';
          highContrastOption.id = 'high-contrast-mode';
          highContrastOption.className = 'menu-button';
          highContrastOption.textContent = 'High Contrast Mode';
          dropdownMenu.appendChild(highContrastOption);
        }
      } else {
        const disableDarkeningOption = document.getElementById('disable-darkening');
        const highContrastOption = document.getElementById('high-contrast-mode');
        if (disableDarkeningOption) dropdownMenu.removeChild(disableDarkeningOption);
        if (highContrastOption) dropdownMenu.removeChild(highContrastOption);
      }
    }
  
    // Call updateMenuOptions when dark mode is toggled
    darkModeToggle.addEventListener('click', function() {
      // Your existing dark mode toggle logic here
      // ...
  
      updateMenuOptions();
    });
  
    // Event listeners for new options
    dropdownMenu.addEventListener('click', function(e) {
      if (e.target.id === 'disable-darkening') {
        document.body.classList.toggle('disable-darkening');
        e.target.textContent = document.body.classList.contains('disable-darkening') ? 'Enable Mouse Darkening' : 'Disable Mouse Darkening';
      } else if (e.target.id === 'high-contrast-mode') {
        document.body.classList.toggle('high-contrast');
        e.target.textContent = document.body.classList.contains('high-contrast') ? 'Normal Contrast Mode' : 'High Contrast Mode';
      }
    });
  
    // Initial call to set up menu
    updateMenuOptions();
  });

// Remove unwanted tooltip on the right
const styleElement = document.createElement('style');
styleElement.textContent = `
    .edit-part-name::after {
        content: none;
    }
`;
document.head.appendChild(styleElement);
// Add this to your script.js file

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
  
    menuToggle.addEventListener('click', function() {
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
  
    // Close the menu when clicking outside
    window.addEventListener('click', function(event) {
      if (!event.target.matches('.menu-toggle') && !event.target.closest('.dropdown-menu')) {
        dropdownMenu.style.display = 'none';
      }
    });
  });
  document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const closeChatButton = document.getElementById('close-chat');

    function loadChatMessages() {
        db.collection("messages").orderBy("timestamp")
            .onSnapshot(snapshot => {
                chatBox.innerHTML = "";
                snapshot.forEach(doc => {
                    const message = doc.data().message;
                    chatBox.innerHTML += `<div class="chat-message">${message}</div>`;
                });
                chatBox.scrollTop = chatBox.scrollHeight;
            });
    }

    function saveChatMessage(message) {
        db.collection("messages").add({
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    chatToggle.addEventListener('click', function() {
        chatContainer.classList.toggle('hidden');
    });

    closeChatButton.addEventListener('click', function() {
        chatContainer.classList.add('hidden');
    });

    sendButton.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (message) {
            chatInput.value = '';
            saveChatMessage(message);
        }
    });

    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    loadChatMessages();
});
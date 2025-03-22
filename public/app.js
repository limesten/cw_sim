// UI Elements
const weightInput = document.getElementById('weightInput');
const controlCharsSelect = document.getElementById('controlChars');
const sendOnceButton = document.getElementById('sendOnce');
const startContinuousButton = document.getElementById('startContinuous');
const stopContinuousButton = document.getElementById('stopContinuous');
const weightsPerMinuteInput = document.getElementById('weightsPerMinute');
const messageLog = document.getElementById('messageLog');
const clientCountSpan = document.getElementById('clientCount');

// Ensure weight input only accepts whole numbers
weightInput.addEventListener('input', () => {
    const value = parseInt(weightInput.value);
    if (value < 0) {
        weightInput.value = 0;
    } else {
        weightInput.value = Math.floor(value);
    }
});

// WebSocket setup
const ws = new WebSocket(`ws://${window.location.host}`);

// WebSocket event handlers
ws.onopen = () => {
    logMessage('Connected to server');
    enableControls(true);
};

ws.onclose = () => {
    logMessage('Disconnected from server');
    enableControls(false);
    clientCountSpan.textContent = '0';
};

ws.onerror = (error) => {
    logMessage('WebSocket error: ' + error.message);
    enableControls(false);
};

ws.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);
        if (message.type === 'clientCount') {
            updateClientCount(message.count);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
};

// UI event handlers
sendOnceButton.addEventListener('click', () => {
    sendWeight();
});

startContinuousButton.addEventListener('click', () => {
    startContinuous();
});

stopContinuousButton.addEventListener('click', () => {
    stopContinuous();
});

controlCharsSelect.addEventListener('change', () => {
    updateControlChars();
});

// Helper functions
function updateClientCount(count) {
    clientCountSpan.textContent = count;
    logMessage(`Connected test clients: ${count}`);
}

function sendWeight() {
    const weight = parseInt(weightInput.value);
    if (isNaN(weight) || weight < 0) {
        logMessage('Error: Please enter a valid weight in grams');
        return;
    }

    const message = {
        type: 'weight',
        weight: weight.toString() // Send as string to maintain exact value
    };
    ws.send(JSON.stringify(message));
    logMessage(`Sent weight: ${weight}g`);
}

function startContinuous() {
    const weight = parseInt(weightInput.value);
    if (isNaN(weight) || weight < 0) {
        logMessage('Error: Please enter a valid weight in grams');
        return;
    }

    const weightsPerMinute = parseInt(weightsPerMinuteInput.value);
    if (weightsPerMinute < 1 || weightsPerMinute > 600) {
        logMessage('Error: Weights per minute must be between 1 and 600');
        return;
    }

    const message = {
        type: 'startContinuous',
        weight: weight.toString(), // Send as string to maintain exact value
        weightsPerMinute: weightsPerMinute
    };
    ws.send(JSON.stringify(message));
    
    startContinuousButton.disabled = true;
    stopContinuousButton.disabled = false;
    logMessage(`Started continuous transmission at ${weightsPerMinute} weights/minute with ${weight}g`);
}

function stopContinuous() {
    const message = {
        type: 'stopContinuous'
    };
    ws.send(JSON.stringify(message));
    
    startContinuousButton.disabled = false;
    stopContinuousButton.disabled = true;
    logMessage('Stopped continuous transmission');
}

function updateControlChars() {
    const controlChars = controlCharsSelect.value;
    const message = {
        type: 'settings',
        controlChars: controlChars
    };
    ws.send(JSON.stringify(message));
    logMessage(`Updated control characters to: ${controlChars}`);
}

function logMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    messageLog.insertBefore(messageDiv, messageLog.firstChild);
}

function enableControls(enabled) {
    sendOnceButton.disabled = !enabled;
    startContinuousButton.disabled = !enabled;
    controlCharsSelect.disabled = !enabled;
    weightsPerMinuteInput.disabled = !enabled;
    
    if (!enabled) {
        stopContinuousButton.disabled = true;
    }
} 
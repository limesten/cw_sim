// UI Elements
const weightInput = document.getElementById('weightInput');
const sendOnceButton = document.getElementById('sendOnce');
const startContinuousButton = document.getElementById('startContinuous');
const stopContinuousButton = document.getElementById('stopContinuous');
const weightsPerMinuteInput = document.getElementById('weightsPerMinute');
const messageLog = document.getElementById('messageLog');
const clientCountSpan = document.getElementById('clientCount');

// Weight variation elements
const underweightFreqInput = document.getElementById('underweightFreq');
const underweightAmountInput = document.getElementById('underweightAmount');
const overweightFreqInput = document.getElementById('overweightFreq');
const overweightAmountInput = document.getElementById('overweightAmount');

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
};

ws.onerror = (error) => {
    logMessage('WebSocket error: ' + error.message);
    enableControls(false);
};

ws.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);
    } catch (error) {
        console.error('Error processing message:', error);
    }
};

// UI event handlers
sendOnceButton.addEventListener('click', () => {
    sendWeight();
});

startContinuousButton.addEventListener('click', () => {
    if (validateWeightVariations()) {
        startContinuous();
    }
});

stopContinuousButton.addEventListener('click', () => {
    stopContinuous();
});

// Helper functions
function validateWeightVariations() {
    const underFreq = parseFloat(underweightFreqInput.value);
    const overFreq = parseFloat(overweightFreqInput.value);
    const totalFreq = underFreq + overFreq;

    if (totalFreq > 100) {
        logMessage('Error: Total of under and overweight frequencies cannot exceed 100%');
        return false;
    }

    const underAmount = parseFloat(underweightAmountInput.value);
    const overAmount = parseFloat(overweightAmountInput.value);

    if (underAmount >= 100 || overAmount >= 100) {
        logMessage('Error: Weight variation amounts must be less than 100%');
        return false;
    }

    return true;
}

function sendWeight() {
    const prefix = prefixInput.value;
    const weight = weightInput.value;
    const suffix = suffixInput.value;

    const message = {
        type: 'weight',
        prefix: prefix,
        weight: weight,
        suffix: suffix
    };
    ws.send(JSON.stringify(message));
    logMessage(`Sent string: ${prefix}${weight}${suffix}`);
}

function startContinuous() {
    const weight = parseInt(weightInput.value);
    if (isNaN(weight) || weight < 0) {
        logMessage('Error: Weight needs to be a positive number');
        return;
    }

    const weightsPerMinute = parseInt(weightsPerMinuteInput.value);
    if (weightsPerMinute < 1 || weightsPerMinute > 600) {
        logMessage('Error: Weights per minute must be between 1 and 600');
        return;
    }

    const message = {
        type: 'startContinuous',
        weight: weight.toString(),
        weightsPerMinute: weightsPerMinute,
        variations: {
            underweight: {
                frequency: parseFloat(underweightFreqInput.value) / 100,
                amount: parseFloat(underweightAmountInput.value) / 100
            },
            overweight: {
                frequency: parseFloat(overweightFreqInput.value) / 100,
                amount: parseFloat(overweightAmountInput.value) / 100
            }
        }
    };
    ws.send(JSON.stringify(message));
    
    startContinuousButton.disabled = true;
    stopContinuousButton.disabled = false;
    logMessage(`Started continuous transmission at ${weightsPerMinute} weights/minute with ${weight}g`);
    logMessage(`Underweight: ${underweightFreqInput.value}% at -${underweightAmountInput.value}%`);
    logMessage(`Overweight: ${overweightFreqInput.value}% at +${overweightAmountInput.value}%`);
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

function logMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    messageLog.insertBefore(messageDiv, messageLog.firstChild);
}

function enableControls(enabled) {
    sendOnceButton.disabled = !enabled;
    startContinuousButton.disabled = !enabled;
    weightsPerMinuteInput.disabled = !enabled;
    underweightFreqInput.disabled = !enabled;
    underweightAmountInput.disabled = !enabled;
    overweightFreqInput.disabled = !enabled;
    overweightAmountInput.disabled = !enabled;
    
    if (!enabled) {
        stopContinuousButton.disabled = true;
    }
} 
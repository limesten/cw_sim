const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const port = 3000;

// Control character configurations
const CONTROL_CHARS = {
    STXETX: {
        name: 'STXETX',
        prefix: '\x02', // STX (Start of Text)
        suffix: '\x03', // ETX (End of Text)
        format: (weight) => `${CONTROL_CHARS.STXETX.prefix}${weight}${CONTROL_CHARS.STXETX.suffix}`
    },
    CRLF: {
        name: 'CRLF',
        prefix: '',
        suffix: '\r\n', // CR LF
        format: (weight) => `${weight}${CONTROL_CHARS.CRLF.suffix}`
    }
};

// Create HTTP server instance
const server = http.createServer(app);

// Serve static files
app.use(express.static('public'));

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients with their settings
const clients = new Map(); // Using Map to store client settings

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Initialize client settings with defaults
    const clientSettings = {
        controlChars: CONTROL_CHARS.CRLF, // Default to CRLF
        continuousMode: false,
        interval: null
    };
    clients.set(ws, clientSettings);

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message);
            
            switch (message.type) {
                case 'weight':
                    handleWeightTransmission(ws, message);
                    break;
                case 'settings':
                    handleSettingsUpdate(ws, message);
                    break;
                case 'startContinuous':
                    startContinuousTransmission(ws, message);
                    break;
                case 'stopContinuous':
                    stopContinuousTransmission(ws);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        stopContinuousTransmission(ws);
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        stopContinuousTransmission(ws);
        clients.delete(ws);
    });
});

// Weight transmission handler
function handleWeightTransmission(ws, message) {
    const clientSettings = clients.get(ws);
    if (!clientSettings) return;

    const { weight } = message;
    const formattedWeight = formatWeight(weight, clientSettings.controlChars);
    
    // Log the formatted weight for debugging (server-side only)
    console.log('Sending weight:', formatWeightForDisplay(formattedWeight));
    
    // Send raw data to client
    ws.send(formattedWeight);
}

// Settings update handler
function handleSettingsUpdate(ws, message) {
    const clientSettings = clients.get(ws);
    if (!clientSettings) return;

    if (message.controlChars && CONTROL_CHARS[message.controlChars]) {
        clientSettings.controlChars = CONTROL_CHARS[message.controlChars];
        console.log(`Updated control chars to: ${message.controlChars}`);
    }
}

// Format weight with control characters
function formatWeight(weight, controlChars) {
    return controlChars.format(weight);
}

// Format weight for display in logs (server-side only)
function formatWeightForDisplay(raw) {
    return raw.replace(/[\x00-\x1F]/g, char => {
        const special = {
            '\x02': '<STX>',
            '\x03': '<ETX>',
            '\r': '<CR>',
            '\n': '<LF>'
        };
        return special[char] || `<${char.charCodeAt(0).toString(16).padStart(2, '0')}>`;
    });
}

// Continuous transmission handlers
function startContinuousTransmission(ws, message) {
    const clientSettings = clients.get(ws);
    if (!clientSettings) return;

    // Stop any existing continuous transmission
    stopContinuousTransmission(ws);

    const { weight, weightsPerMinute } = message;
    const interval = Math.floor(60000 / weightsPerMinute); // Convert weights per minute to milliseconds

    clientSettings.continuousMode = true;
    clientSettings.interval = setInterval(() => {
        handleWeightTransmission(ws, { weight });
    }, interval);
}

function stopContinuousTransmission(ws) {
    const clientSettings = clients.get(ws);
    if (!clientSettings) return;

    if (clientSettings.interval) {
        clearInterval(clientSettings.interval);
        clientSettings.interval = null;
    }
    clientSettings.continuousMode = false;
}

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebSocket server is ready`);
});

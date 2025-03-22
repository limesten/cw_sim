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
wss.on('connection', (ws, req) => {
    // Check if this is a frontend client (will send JSON messages) or a test client (receives raw data)
    const isTestClient = !req.headers.origin;
    console.log(`New ${isTestClient ? 'test' : 'frontend'} client connected`);
    
    // Initialize client settings with defaults
    const clientSettings = {
        controlChars: CONTROL_CHARS.CRLF, // Default to CRLF
        continuousMode: false,
        interval: null,
        isTestClient: isTestClient
    };
    clients.set(ws, clientSettings);

    // Handle incoming messages (only from frontend)
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message);
            
            switch (message.type) {
                case 'weight':
                    broadcastWeight(message);
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
        const clientType = clients.get(ws)?.isTestClient ? 'test' : 'frontend';
        console.log(`${clientType} client disconnected`);
        stopContinuousTransmission(ws);
        clients.delete(ws);
        updateFrontendClientCount();
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        stopContinuousTransmission(ws);
        clients.delete(ws);
        updateFrontendClientCount();
    });

    // Update frontend with new client count
    updateFrontendClientCount();
});

// Broadcast weight to test clients
function broadcastWeight(message) {
    const { weight } = message;
    
    // Send to all test clients
    for (const [ws, settings] of clients.entries()) {
        if (settings.isTestClient) {
            const formattedWeight = formatWeight(weight, settings.controlChars);
            console.log('Sending weight to test client:', formatWeightForDisplay(formattedWeight));
            ws.send(formattedWeight);
        }
    }
}

// Update frontend clients with test client count
function updateFrontendClientCount() {
    let testClientCount = 0;
    for (const settings of clients.values()) {
        if (settings.isTestClient) testClientCount++;
    }

    // Send count to all frontend clients
    for (const [ws, settings] of clients.entries()) {
        if (!settings.isTestClient) {
            ws.send(JSON.stringify({
                type: 'clientCount',
                count: testClientCount
            }));
        }
    }
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

    const { weight, weightsPerMinute, variations } = message;
    const baseWeight = parseInt(weight);
    const interval = Math.floor(60000 / weightsPerMinute); // Convert weights per minute to milliseconds

    clientSettings.continuousMode = true;
    clientSettings.interval = setInterval(() => {
        // Calculate the weight with variations
        const finalWeight = calculateVariedWeight(baseWeight, variations);
        broadcastWeight({ weight: finalWeight.toString() });
    }, interval);
}

// Calculate weight with random variations based on probabilities
function calculateVariedWeight(baseWeight, variations) {
    const random = Math.random(); // Random number between 0 and 1
    
    if (variations) {
        const { underweight, overweight } = variations;
        
        // Check for underweight
        if (random < underweight.frequency) {
            const reduction = baseWeight * underweight.amount;
            return Math.round(baseWeight - reduction);
        }
        
        // Check for overweight (adding frequencies)
        if (random < (underweight.frequency + overweight.frequency)) {
            const addition = baseWeight * overweight.amount;
            return Math.round(baseWeight + addition);
        }
    }
    
    // Return base weight if no variation applies
    return baseWeight;
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

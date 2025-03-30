const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const net = require('node:net');

const app = express();
const wsPort = 3000;
const tcpPort = 3001;

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

// Global settings that apply to all test clients
const globalSettings = {
    controlChars: CONTROL_CHARS.CRLF
};

// Create HTTP server instance
const wsServer = http.createServer(app);

// Create TCP server instance
const tcpServer = net.createServer();

// Serve static files
app.use(express.static('public'));

// Create WebSocket server
const wss = new WebSocketServer({ server: wsServer });

// Store connected clients with their settings
const clients = new Map(); // Using Map to store client settings

// Store connected tcp clients
let tcpClients = [];

// WebSocket connection handler (frontend clients)
wss.on('connection', (ws, req) => {
    // Initialize client settings with defaults
    const clientSettings = {
        continuousMode: false,
        interval: null,
    };
    clients.set(ws, clientSettings);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message);
            
            switch (message.type) {
                case 'weight':
                    broadcastWeight(message);
                    break;
                case 'settings':
                    handleSettingsUpdate(message);
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

// TCP connection handler
tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    tcpClients.push(socket);

    socket.on('data', (data) => {
        console.log('Received data from TCP client:', data);
    });
    socket.on('close', () => {
        tcpClients = tcpClients.filter(client => client !== socket);
        console.log('TCP client disconnected');
    });
});

// Broadcast weight to tcp clients
function broadcastWeight(message) {
    const { weight } = message;
    
    // Send to all tcp clients
    for (const client of tcpClients) {
        const formattedWeight = formatWeight(weight, globalSettings.controlChars);
        console.log('Sending weight to tcp client:', formatWeightForDisplay(formattedWeight));
        client.write(formattedWeight);
    }
}

// Settings update handler
function handleSettingsUpdate(message) {
    if (message.controlChars && CONTROL_CHARS[message.controlChars]) {
        globalSettings.controlChars = CONTROL_CHARS[message.controlChars];
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

// Start the ws server
wsServer.listen(wsPort, () => {
    console.log(`Server running on port ${wsPort}`);
});

// Start the tcp server
tcpServer.listen(tcpPort, () => {
    console.log(`TCP server is ready on port ${tcpPort}`);
});


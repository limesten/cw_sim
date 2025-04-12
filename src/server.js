const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const net = require('node:net');

const app = express();
const wsPort = 3000;
const tcpPort = 3001;

const wsServer = http.createServer(app);

const tcpServer = net.createServer();

app.use(express.static('public'));

const wss = new WebSocketServer({ server: wsServer });

// Store connected clients with their settings
const clients = new Map();

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

    ws.on('close', () => {
        stopContinuousTransmission(ws);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        stopContinuousTransmission(ws);
        clients.delete(ws);
    });

});

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    tcpClients.push(socket);
    updateConnectedClientCount();
    socket.on('data', (data) => {
        console.log('Received data from TCP client:', data);
    });
    socket.on('close', () => {
        tcpClients = tcpClients.filter(client => client !== socket);
        console.log('TCP client disconnected');
        updateConnectedClientCount();
    });
});

function updateConnectedClientCount() {
    const count = tcpClients.length;
    wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: 'connectedClients', count }));
    });
}

function formatMessage(prefix, weight, suffix) {
    // Convert control characters to their actual values
    const prefixBuffer = Buffer.from(prefix.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))));
    const suffixBuffer = Buffer.from(suffix.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))));
    const weightBuffer = Buffer.from(weight);

    return [prefixBuffer, weightBuffer, suffixBuffer]
}

function broadcastWeight(message) {
    const { prefix, weight, suffix } = message;
    
    const messageFormatted = formatMessage(prefix, weight, suffix);

    const messageBuffer = Buffer.concat(messageFormatted);
    
    // Send to all tcp client
    for (const client of tcpClients) {
        client.write(messageBuffer);
    }
}

function startContinuousTransmission(ws, message) {
    const clientSettings = clients.get(ws);
    if (!clientSettings) return;

    // Stop any existing continuous transmission
    stopContinuousTransmission(ws);

    const { prefix, weight, suffix, weightsPerMinute, variations } = message;
    const baseWeight = parseInt(weight);
    const interval = Math.floor(60000 / weightsPerMinute); // Convert weights per minute to milliseconds

    clientSettings.continuousMode = true;
    clientSettings.interval = setInterval(() => {
        // Calculate the weight with variations
        const finalWeight = calculateVariedWeight(baseWeight, variations);
        broadcastWeight({ prefix, weight: finalWeight.toString(), suffix });
    }, interval);
}

function calculateVariedWeight(baseWeight, variations) {
    const random = Math.random();
    
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

wsServer.listen(wsPort, () => {
    console.log(`Server running on port ${wsPort}`);
});

tcpServer.listen(tcpPort, () => {
    console.log(`TCP server is ready on port ${tcpPort}`);
});


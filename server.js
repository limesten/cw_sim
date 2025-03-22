const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const port = 3000;

// Create HTTP server instance
const server = http.createServer(app);

// Serve static files
app.use(express.static('public'));

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send initial connection confirmation
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to checkweigher simulator'
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message);
            
            // Handle different message types here
            switch (message.type) {
                case 'weight':
                    // Handle weight transmission
                    handleWeightTransmission(ws, message);
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
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Weight transmission handler
function handleWeightTransmission(ws, message) {
    // TODO: Implement weight transmission logic with control characters
    console.log('Weight transmission requested:', message);
}

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebSocket server is ready`);
});

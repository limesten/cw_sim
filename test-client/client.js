const net = require('node:net');

// Configuration
const PORT = 3001;
const HOST = 'localhost';

// Control character display mapping
const CONTROL_CHAR_DISPLAY = {
    '\x02': '<STX>',  // STX
    '\x03': '<ETX>',  // ETX
    '\r': '<CR>',     // CR
    '\n': '<LF>'      // LF
};

// Format raw data for display
function formatDataForDisplay(data) {
    // replace control char with control char display
    const chars = data.toString().split('');
    const displayData = chars.map(char => {
        // check if char exists as key in control char display
        if (Object.keys(CONTROL_CHAR_DISPLAY).includes(char)) {
            return CONTROL_CHAR_DISPLAY[char];
        }
        return char;
    }).join('');
    return displayData;
}

// Create TCP client
const client = net.createConnection({
    host: HOST,
    port: PORT
}, () => {
    console.log('Connected to server');
});

// Handle incoming data
client.on('data', (data) => {
    console.log('Received data:', formatDataForDisplay(data));
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Connection error:', err);
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('end', () => {
    console.log('Connection ended');
});

const WebSocket = require('ws');
const readline = require('readline');

// Configuration
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';

// Parse command line arguments for host and port
const args = process.argv.slice(2);
const host = args[0] || DEFAULT_HOST;
const port = args[1] || DEFAULT_PORT;

// Create WebSocket connection
const ws = new WebSocket(`ws://${host}:${port}`);

// Control character display mapping
const CONTROL_CHAR_DISPLAY = {
    '\x02': '<STX>',  // STX
    '\x03': '<ETX>',  // ETX
    '\r': '<CR>',     // CR
    '\n': '<LF>'      // LF
};

// Format raw data for display
function formatDataForDisplay(data) {
    return Array.from(data).map(char => {
        const charCode = char.charCodeAt(0);
        if (charCode < 32) { // Control characters
            return CONTROL_CHAR_DISPLAY[char] || `<${charCode.toString(16).padStart(2, '0')}>`;
        }
        return char;
    }).join('');
}

// WebSocket event handlers
ws.on('open', () => {
    console.log(`Connected to checkweigher simulator at ${host}:${port}`);
    console.log('Waiting for weight values...\n');
});

ws.on('message', (data) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedData = formatDataForDisplay(data.toString());
    console.log(`[${timestamp}] Received: ${formattedData}`);
});

ws.on('close', () => {
    console.log('Disconnected from checkweigher simulator');
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nClosing connection...');
    ws.close();
});

// Setup readline interface for interactive commands
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Display help message
console.log('\nTest Client Commands:');
console.log('  Press Ctrl+C to exit');
console.log('  Type "clear" to clear the console');
console.log('  Type "help" to show this message\n');

// Handle user input
rl.on('line', (input) => {
    switch (input.trim().toLowerCase()) {
        case 'clear':
            console.clear();
            console.log('Console cleared. Waiting for weight values...\n');
            break;
        case 'help':
            console.log('\nTest Client Commands:');
            console.log('  Press Ctrl+C to exit');
            console.log('  Type "clear" to clear the console');
            console.log('  Type "help" to show this message\n');
            break;
        default:
            console.log('Unknown command. Type "help" for available commands.\n');
    }
}); 
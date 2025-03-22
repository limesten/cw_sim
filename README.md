# Checkweigher Simulator

A web-based simulator for testing checkweigher integrations. This tool simulates a checkweigher device that sends weight measurements over WebSocket connections, supporting both single and continuous weight transmissions with configurable weight variations.

## Features

### Browser Frontend
- **Weight Input**: Enter custom weight values to transmit
- **Control Characters**: Choose between CR/LF and STX/ETX transmission formats
- **Transmission Modes**:
  - Single transmission: Send one weight value
  - Continuous mode: Automatically send weight values at specified intervals
- **Weight Variations**: Configure random weight variations to simulate real-world scenarios
  - Set underweight and overweight frequencies (percentage of occurrences)
  - Define variation amounts as percentage of base weight
  - Example: 1% underweight frequency with 10% weight reduction
- **Real-time Monitoring**:
  - Message log showing transmission events
  - Connected clients counter
  - Visual feedback for weight transmissions

### Test Client
- Terminal-based client for receiving weight transmissions
- Logs received weight values with control characters
- Useful for testing and verification

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd cw_sim
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

1. Start the server:
```bash
npm start
```

2. Access the frontend interface:
- Open your browser and navigate to `http://localhost:3000`

3. Run the test client (in a separate terminal):
```bash
cd test-client
node index.js
```

## Usage Guide

### Setting Up Weight Transmissions

1. In the browser interface:
   - Enter a base weight value
   - Select desired control characters (CR/LF or STX/ETX)
   - Configure weight variations if needed:
     - Underweight frequency (0-100%)
     - Underweight amount (0-100%)
     - Overweight frequency (0-100%)
     - Overweight amount (0-100%)

2. Choose transmission mode:
   - Click "Send Once" for single transmission
   - Click "Start Continuous" for continuous transmission
   - Use "Stop" to halt continuous transmission

### Testing

Run the test suite:
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm test -- --coverage     # Generate coverage report
```

## Technical Details

### Communication Protocol
- WebSocket-based communication
- Supports two control character formats:
  - CR/LF (Carriage Return/Line Feed)
  - STX/ETX (Start of Text/End of Text)

### Weight Variation Algorithm
- Randomized weight variations based on configured probabilities
- Independent calculation for each transmission
- Maintains specified frequency distributions for under/overweight values

## Development

### Project Structure
```
cw_sim/
├── public/           # Static frontend files
├── src/             # Server source code
├── test-client/     # Test client implementation
└── tests/           # Test suites
    └── unit/        # Unit tests
```

### Running Tests
The project includes comprehensive test coverage for:
- Weight calculation logic
- Control character formatting
- Input validation
- WebSocket communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
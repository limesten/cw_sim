# Checkweigher Simulator

This tool simulates a checkweigher device that sends weight measurements over tcp/ip socket connections, supporting both single and continuous weight transmissions with configurable weight variations.

## Features

### Browser Frontend
- **Weight Input**: Enter weight values to transmit
- **Prefix and Suffix**: Input characters that will appear before and after the weight value (optional). It is also possible to input hexadecimal values. Example for character return: \x0D
- **Transmission Modes**:
  - Single transmission: Send one weight value
  - Continuous mode: Automatically send weight values at specified intervals
- **Weight Variations**:
  - Set underweight and overweight frequencies (percentage of occurrences)
  - Define variation amounts as percentage of base weight
  - Example: 1% underweight frequency with 10% weight reduction
- **Real-time Monitoring**:
  - Message log showing transmission events
  - Connected clients counter

### Test Client
- Terminal-based client for receiving weight transmissions
- Logs received weight values
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
npm start
```

### Testing

Run the test suite:
```bash
npm test
npm run test:watch
npm test -- --coverage
```

## Technical Details

### Communication Protocol
- WebSocket-based communication with frontend clients
- TCP/IP socket communication with weight data consumers

### Weight Variations
- Randomized weight variations based on configured probabilities
- Independent calculation for each transmission
- Maintains specified frequency distributions for under/overweight values

## Development

### Project Structure
```
cw_sim/
├── public/          # Static frontend files
├── src/             # Server source code
├── test-client/     # Test client implementation
└── tests/           # Test suites
    └── unit/        # Unit tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
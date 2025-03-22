class MockWebSocket {
    constructor(isTestClient = false) {
        this.isTestClient = isTestClient;
        this.messageHandlers = new Set();
        this.closeHandlers = new Set();
        this.errorHandlers = new Set();
        this.sentMessages = [];
        this.headers = {
            origin: isTestClient ? undefined : 'http://localhost'
        };
    }

    // WebSocket API simulation
    on(event, handler) {
        switch (event) {
            case 'message':
                this.messageHandlers.add(handler);
                break;
            case 'close':
                this.closeHandlers.add(handler);
                break;
            case 'error':
                this.errorHandlers.add(handler);
                break;
        }
    }

    send(data) {
        this.sentMessages.push(data);
    }

    close() {
        this.closeHandlers.forEach(handler => handler());
    }

    // Test helper methods
    simulateMessage(data) {
        this.messageHandlers.forEach(handler => handler(data));
    }

    simulateError(error) {
        this.errorHandlers.forEach(handler => handler(error));
    }

    getLastMessage() {
        return this.sentMessages[this.sentMessages.length - 1];
    }

    getAllMessages() {
        return [...this.sentMessages];
    }

    clearMessages() {
        this.sentMessages = [];
    }
}

module.exports = MockWebSocket; 
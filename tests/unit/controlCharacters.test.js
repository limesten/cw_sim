const { formatWeight, CONTROL_CHARS } = require('../../src/controlCharacters');

describe('Control Characters', () => {
    describe('STX/ETX Formatting', () => {
        test('should format weight with STX/ETX correctly', () => {
            const weight = '1234';
            const result = formatWeight(weight, CONTROL_CHARS.STXETX);
            expect(result).toBe('\x021234\x03');
        });

        test('should handle zero weight with STX/ETX', () => {
            const weight = '0';
            const result = formatWeight(weight, CONTROL_CHARS.STXETX);
            expect(result).toBe('\x020\x03');
        });

        test('should handle large numbers with STX/ETX', () => {
            const weight = '999999';
            const result = formatWeight(weight, CONTROL_CHARS.STXETX);
            expect(result).toBe('\x02999999\x03');
        });
    });

    describe('CR/LF Formatting', () => {
        test('should format weight with CR/LF correctly', () => {
            const weight = '1234';
            const result = formatWeight(weight, CONTROL_CHARS.CRLF);
            expect(result).toBe('1234\r\n');
        });

        test('should handle zero weight with CR/LF', () => {
            const weight = '0';
            const result = formatWeight(weight, CONTROL_CHARS.CRLF);
            expect(result).toBe('0\r\n');
        });

        test('should handle large numbers with CR/LF', () => {
            const weight = '999999';
            const result = formatWeight(weight, CONTROL_CHARS.CRLF);
            expect(result).toBe('999999\r\n');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty weight string', () => {
            const weight = '';
            const resultSTXETX = formatWeight(weight, CONTROL_CHARS.STXETX);
            const resultCRLF = formatWeight(weight, CONTROL_CHARS.CRLF);
            
            expect(resultSTXETX).toBe('\x02\x03');
            expect(resultCRLF).toBe('\r\n');
        });

        test('should handle null weight', () => {
            const weight = null;
            expect(() => formatWeight(weight, CONTROL_CHARS.STXETX)).toThrow();
            expect(() => formatWeight(weight, CONTROL_CHARS.CRLF)).toThrow();
        });

        test('should handle undefined weight', () => {
            const weight = undefined;
            expect(() => formatWeight(weight, CONTROL_CHARS.STXETX)).toThrow();
            expect(() => formatWeight(weight, CONTROL_CHARS.CRLF)).toThrow();
        });

        test('should handle invalid control character type', () => {
            const weight = '1234';
            expect(() => formatWeight(weight, { name: 'INVALID' })).toThrow();
        });
    });

    describe('Control Character Constants', () => {
        test('should have correct STX/ETX configuration', () => {
            expect(CONTROL_CHARS.STXETX).toBeDefined();
            expect(CONTROL_CHARS.STXETX.name).toBe('STXETX');
            expect(CONTROL_CHARS.STXETX.prefix).toBe('\x02');
            expect(CONTROL_CHARS.STXETX.suffix).toBe('\x03');
        });

        test('should have correct CR/LF configuration', () => {
            expect(CONTROL_CHARS.CRLF).toBeDefined();
            expect(CONTROL_CHARS.CRLF.name).toBe('CRLF');
            expect(CONTROL_CHARS.CRLF.prefix).toBe('');
            expect(CONTROL_CHARS.CRLF.suffix).toBe('\r\n');
        });
    });
}); 
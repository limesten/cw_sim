/**
 * Control character configurations for weight formatting
 */
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

/**
 * Formats a weight value with the specified control characters
 * @param {string} weight - The weight value to format
 * @param {Object} controlChars - The control character configuration to use
 * @returns {string} The formatted weight value
 * @throws {Error} If weight is null/undefined or control characters are invalid
 */
function formatWeight(weight, controlChars) {
    // Validate input
    if (weight === null || weight === undefined) {
        throw new Error('Weight value cannot be null or undefined');
    }

    if (!controlChars || !controlChars.format) {
        throw new Error('Invalid control character configuration');
    }

    // Format the weight
    return controlChars.format(weight);
}

module.exports = {
    CONTROL_CHARS,
    formatWeight
}; 
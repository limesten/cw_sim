/**
 * Validates a weight value
 * @param {string|number} weight - The weight value to validate
 * @returns {boolean} True if weight is valid, false otherwise
 */
function validateWeight(weight) {
    if (weight === null || weight === undefined) return false;
    
    // Convert to string if number
    const weightStr = weight.toString();
    
    // Check if it's a positive integer
    return /^\d+$/.test(weightStr);
}

/**
 * Validates weight variation settings
 * @param {Object} variations - The variation settings to validate
 * @returns {boolean} True if variations are valid, false otherwise
 */
function validateWeightVariations(variations) {
    if (!variations) return false;

    // Check if at least one variation type is present
    if (!variations.underweight && !variations.overweight) return false;

    let totalFrequency = 0;

    // Validate underweight settings if present
    if (variations.underweight) {
        const { frequency, amount } = variations.underweight;
        
        if (!isValidProbability(frequency) || !isValidProbability(amount)) {
            return false;
        }

        totalFrequency += frequency;
    }

    // Validate overweight settings if present
    if (variations.overweight) {
        const { frequency, amount } = variations.overweight;
        
        if (!isValidProbability(frequency) || !isValidProbability(amount)) {
            return false;
        }

        totalFrequency += frequency;
    }

    // Check if total frequency is valid (≤ 100%)
    return totalFrequency <= 1;
}

/**
 * Validates if a value is a valid probability (between 0 and 1 inclusive)
 * @param {number} value - The value to validate
 * @returns {boolean} True if value is a valid probability, false otherwise
 */
function isValidProbability(value) {
    return typeof value === 'number' && value >= 0 && value <= 1;
}

module.exports = {
    validateWeight,
    validateWeightVariations
}; 
/**
 * Calculates a weight value with possible variations based on provided probabilities
 * @param {number} baseWeight - The base weight value in grams
 * @param {Object} variations - Configuration for weight variations
 * @param {Object} variations.underweight - Underweight variation settings
 * @param {number} variations.underweight.frequency - Probability of underweight (0-1)
 * @param {number} variations.underweight.amount - Amount to reduce by (0-1)
 * @param {Object} variations.overweight - Overweight variation settings
 * @param {number} variations.overweight.frequency - Probability of overweight (0-1)
 * @param {number} variations.overweight.amount - Amount to increase by (0-1)
 * @returns {number} The final weight value in grams
 */
function calculateVariedWeight(baseWeight, variations) {
    // Return base weight if no variations specified
    if (!variations) return baseWeight;

    const random = Math.random(); // Random number between 0 and 1
    
    const { underweight, overweight } = variations;
    
    // Check for underweight
    if (underweight && random < underweight.frequency) {
        const reduction = baseWeight * underweight.amount;
        return Math.round(baseWeight - reduction);
    }
    
    // Check for overweight (adding frequencies)
    if (overweight && random < (underweight?.frequency || 0) + overweight.frequency) {
        const addition = baseWeight * overweight.amount;
        return Math.round(baseWeight + addition);
    }
    
    // Return base weight if no variation applies
    return baseWeight;
}

module.exports = {
    calculateVariedWeight
}; 
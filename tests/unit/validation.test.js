const { validateWeight, validateWeightVariations } = require('../../src/validation');

describe('Input Validation', () => {
    describe('Weight Validation', () => {
        test('should accept valid weight values', () => {
            expect(validateWeight('100')).toBe(true);
            expect(validateWeight('0')).toBe(true);
            expect(validateWeight('999999')).toBe(true);
        });

        test('should reject negative weights', () => {
            expect(validateWeight('-1')).toBe(false);
            expect(validateWeight('-100')).toBe(false);
        });

        test('should reject non-numeric weights', () => {
            expect(validateWeight('abc')).toBe(false);
            expect(validateWeight('12.34')).toBe(false);
            expect(validateWeight('100a')).toBe(false);
        });

        test('should reject null/undefined weights', () => {
            expect(validateWeight(null)).toBe(false);
            expect(validateWeight(undefined)).toBe(false);
        });
    });

    describe('Weight Variations Validation', () => {
        test('should accept valid variation settings', () => {
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 },
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations)).toBe(true);
        });

        test('should reject total frequency exceeding 100%', () => {
            const variations = {
                underweight: { frequency: 0.5, amount: 0.1 },
                overweight: { frequency: 0.6, amount: 0.1 }
            };
            expect(validateWeightVariations(variations)).toBe(false);
        });

        test('should reject invalid frequency values', () => {
            const variations1 = {
                underweight: { frequency: -0.1, amount: 0.1 },
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations1)).toBe(false);

            const variations2 = {
                underweight: { frequency: 1.1, amount: 0.1 },
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations2)).toBe(false);
        });

        test('should reject invalid amount values', () => {
            const variations1 = {
                underweight: { frequency: 0.1, amount: -0.1 },
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations1)).toBe(false);

            const variations2 = {
                underweight: { frequency: 0.1, amount: 1.1 },
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations2)).toBe(false);
        });

        test('should handle missing variation settings', () => {
            const variations1 = {
                underweight: { frequency: 0.1, amount: 0.1 }
                // missing overweight
            };
            expect(validateWeightVariations(variations1)).toBe(true);

            const variations2 = {
                // missing underweight
                overweight: { frequency: 0.2, amount: 0.1 }
            };
            expect(validateWeightVariations(variations2)).toBe(true);
        });

        test('should reject invalid variation objects', () => {
            expect(validateWeightVariations(null)).toBe(false);
            expect(validateWeightVariations(undefined)).toBe(false);
            expect(validateWeightVariations({})).toBe(false);
            expect(validateWeightVariations({ invalid: true })).toBe(false);
        });
    });
}); 
const { calculateVariedWeight } = require('../../src/weightCalculator');

// Mock Math.random for predictable tests
const mockRandom = (value) => {
    const original = Math.random;
    Math.random = jest.fn(() => value);
    return () => { Math.random = original; };
};

describe('Weight Calculator', () => {
    describe('Base Weight Handling', () => {
        test('should return base weight when no variations provided', () => {
            const baseWeight = 100;
            const result = calculateVariedWeight(baseWeight);
            expect(result).toBe(baseWeight);
        });

        test('should return base weight when variations are null', () => {
            const baseWeight = 100;
            const result = calculateVariedWeight(baseWeight, null);
            expect(result).toBe(baseWeight);
        });

        test('should return base weight when variations have zero frequencies', () => {
            const baseWeight = 100;
            const variations = {
                underweight: { frequency: 0, amount: 0.1 },
                overweight: { frequency: 0, amount: 0.1 }
            };
            const result = calculateVariedWeight(baseWeight, variations);
            expect(result).toBe(baseWeight);
        });
    });

    describe('Weight Variations', () => {
        test('should apply underweight variation correctly', () => {
            const restore = mockRandom(0.005); // Will trigger underweight (0.5%)
            const baseWeight = 100;
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 }, // 1% chance, 10% reduction
                overweight: { frequency: 0, amount: 0 }
            };
            
            const result = calculateVariedWeight(baseWeight, variations);
            expect(result).toBe(90); // 100 - (100 * 0.1)
            restore();
        });

        test('should apply overweight variation correctly', () => {
            const restore = mockRandom(0.015); // Will trigger overweight (1.5%)
            const baseWeight = 100;
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 }, // 1% chance
                overweight: { frequency: 0.02, amount: 0.1 }   // 2% chance, 10% increase
            };
            
            const result = calculateVariedWeight(baseWeight, variations);
            expect(result).toBe(110); // 100 + (100 * 0.1)
            restore();
        });

        test('should maintain base weight when random falls outside variation ranges', () => {
            const restore = mockRandom(0.95); // Will not trigger any variation
            const baseWeight = 100;
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 },
                overweight: { frequency: 0.02, amount: 0.1 }
            };
            
            const result = calculateVariedWeight(baseWeight, variations);
            expect(result).toBe(baseWeight);
            restore();
        });
    });

    describe('Distribution Testing', () => {
        test('should maintain approximate distribution over many iterations', () => {
            const baseWeight = 100;
            const iterations = 10000;
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 }, // 1%
                overweight: { frequency: 0.20, amount: 0.1 }  // 20%
            };

            let underweightCount = 0;
            let overweightCount = 0;
            let normalCount = 0;

            for (let i = 0; i < iterations; i++) {
                const result = calculateVariedWeight(baseWeight, variations);
                if (result < baseWeight) underweightCount++;
                else if (result > baseWeight) overweightCount++;
                else normalCount++;
            }

            // Check if distributions are within 20% of expected values
            const underweightPercentage = underweightCount / iterations;
            const overweightPercentage = overweightCount / iterations;
            
            expect(underweightPercentage).toBeCloseTo(0.01, 1); // 1% ±0.1
            expect(overweightPercentage).toBeCloseTo(0.20, 1); // 20% ±0.1
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero base weight', () => {
            const variations = {
                underweight: { frequency: 0.01, amount: 0.1 },
                overweight: { frequency: 0.02, amount: 0.1 }
            };
            const result = calculateVariedWeight(0, variations);
            expect(result).toBe(0);
        });

        test('should handle maximum variations', () => {
            const restore = mockRandom(0.005);
            const variations = {
                underweight: { frequency: 1, amount: 0.99 }, // 99% reduction
                overweight: { frequency: 0, amount: 0 }
            };
            const result = calculateVariedWeight(100, variations);
            expect(result).toBe(1); // 100 - (100 * 0.99)
            restore();
        });

        test('should round results to whole numbers', () => {
            const restore = mockRandom(0.005);
            const variations = {
                underweight: { frequency: 1, amount: 0.123 }, // 12.3% reduction
                overweight: { frequency: 0, amount: 0 }
            };
            const result = calculateVariedWeight(100, variations);
            expect(result).toBe(88); // 100 - (100 * 0.123) rounded
            expect(Number.isInteger(result)).toBe(true);
            restore();
        });
    });
}); 
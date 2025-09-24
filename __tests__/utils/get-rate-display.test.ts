import { getRateDisplay } from '@/utils/get-rate-display';
import { Rates } from '@/types';

describe('Rate Display Utilities', () => {
    describe('getRateDisplay', () => {
        it('should display monthly rate with highest priority', () => {
            const rates: Rates = {
                monthly: 2500,
                weekly: 650,
                nightly: 100
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$2,500/mo');
        });

        it('should display weekly rate when monthly is not available', () => {
            const rates: Rates = {
                weekly: 650,
                nightly: 100
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$650/wk');
        });

        it('should display nightly rate when monthly and weekly are not available', () => {
            const rates: Rates = {
                nightly: 100
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$100/night');
        });

        it('should format large numbers with commas', () => {
            const rates: Rates = {
                monthly: 12500,
                weekly: 3250,
                nightly: 500
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$12,500/mo');
        });

        it('should handle zero rates correctly', () => {
            const rates: Rates = {
                monthly: 0,
                weekly: 500
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$0/mo');
        });

        it('should skip invalid monthly rate and use weekly', () => {
            const rates: Rates = {
                monthly: -100, // Invalid negative rate
                weekly: 500,
                nightly: 80
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$500/wk');
        });

        it('should skip invalid weekly rate and use nightly', () => {
            const rates: Rates = {
                weekly: NaN, // Invalid NaN rate
                nightly: 80
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$80/night');
        });

        it('should return undefined when no valid rates are available', () => {
            const rates: Rates = {
                monthly: -100,
                weekly: NaN,
                nightly: Infinity
            };

            const result = getRateDisplay(rates);
            expect(result).toBeUndefined();
        });

        it('should return undefined for null rates parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = getRateDisplay(null as any);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: rates parameter is null or undefined');

            consoleSpy.mockRestore();
        });

        it('should return undefined for undefined rates parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = getRateDisplay(undefined as any);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: rates parameter is null or undefined');

            consoleSpy.mockRestore();
        });

        it('should return undefined for non-object rates parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = getRateDisplay('not-an-object' as any);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: rates parameter is not an object');

            consoleSpy.mockRestore();
        });

        it('should handle empty rates object', () => {
            const rates: Rates = {};

            const result = getRateDisplay(rates);
            expect(result).toBeUndefined();
        });

        it('should warn about invalid monthly rate type', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const rates: Rates = {
                monthly: 'not-a-number' as any,
                weekly: 500
            };

            const result = getRateDisplay(rates);

            expect(result).toBe('$500/wk');
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: monthly rate is not a valid positive number');

            consoleSpy.mockRestore();
        });

        it('should warn about invalid weekly rate type', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const rates: Rates = {
                weekly: 'invalid' as any,
                nightly: 80
            };

            const result = getRateDisplay(rates);

            expect(result).toBe('$80/night');
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: weekly rate is not a valid positive number');

            consoleSpy.mockRestore();
        });

        it('should warn about invalid nightly rate type', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const rates: Rates = {
                nightly: 'bad-value' as any
            };

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: nightly rate is not a valid positive number');

            consoleSpy.mockRestore();
        });

        it('should handle Infinity values as invalid', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const rates: Rates = {
                monthly: Infinity,
                weekly: 500
            };

            const result = getRateDisplay(rates);

            expect(result).toBe('$500/wk');
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: monthly rate is not a valid positive number');

            consoleSpy.mockRestore();
        });

        it('should handle locale formatting errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Mock toLocaleString to throw an error
            const originalToLocaleString = Number.prototype.toLocaleString;
            Number.prototype.toLocaleString = jest.fn().mockImplementation(() => {
                throw new Error('Locale formatting failed');
            });

            const rates: Rates = {
                monthly: 2500
            };

            const result = getRateDisplay(rates);

            expect(result).toBe('$2500/mo');
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: error formatting monthly rate:', expect.any(Error));

            Number.prototype.toLocaleString = originalToLocaleString;
            consoleSpy.mockRestore();
        });

        it('should handle processing errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Create an object that will cause an error during property access
            const problematicRates = {};
            Object.defineProperty(problematicRates, 'monthly', {
                get() {
                    throw new Error('Property access error');
                }
            });

            const result = getRateDisplay(problematicRates as any);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: error processing rates:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should prioritize monthly over weekly and nightly', () => {
            const rates: Rates = {
                monthly: 1000,
                weekly: 300,
                nightly: 50
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$1,000/mo');
        });

        it('should prioritize weekly over nightly when monthly is invalid', () => {
            const rates: Rates = {
                monthly: null as any,
                weekly: 300,
                nightly: 50
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$300/wk');
        });

        it('should handle decimal rates correctly', () => {
            const rates: Rates = {
                nightly: 99.99
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$99.99/night');
        });

        it('should handle very large numbers', () => {
            const rates: Rates = {
                monthly: 1000000
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$1,000,000/mo');
        });

        it('should handle multiple invalid rates and find valid one', () => {
            const rates: Rates = {
                monthly: -500,    // Invalid: negative
                weekly: NaN,      // Invalid: NaN
                nightly: 75       // Valid
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$75/night');
        });
    });

    describe('Real-world Rate Scenarios', () => {
        it('should handle luxury property rates', () => {
            const luxuryRates: Rates = {
                monthly: 15000,
                weekly: 4000,
                nightly: 650
            };

            const result = getRateDisplay(luxuryRates);
            expect(result).toBe('$15,000/mo');
        });

        it('should handle budget property rates', () => {
            const budgetRates: Rates = {
                nightly: 35
            };

            const result = getRateDisplay(budgetRates);
            expect(result).toBe('$35/night');
        });

        it('should handle business travel rates', () => {
            const businessRates: Rates = {
                weekly: 850,
                nightly: 145
            };

            const result = getRateDisplay(businessRates);
            expect(result).toBe('$850/wk');
        });

        it('should handle vacation rental rates', () => {
            const vacationRates: Rates = {
                weekly: 1200,
                nightly: 200
            };

            const result = getRateDisplay(vacationRates);
            expect(result).toBe('$1,200/wk');
        });

        it('should handle corporate housing rates', () => {
            const corporateRates: Rates = {
                monthly: 3500,
                weekly: 950
            };

            const result = getRateDisplay(corporateRates);
            expect(result).toBe('$3,500/mo');
        });
    });

    describe('Edge Cases and Data Validation', () => {
        it('should handle rates object with null values', () => {
            const rates: Rates = {
                monthly: null as any,
                weekly: null as any,
                nightly: null as any
            };

            const result = getRateDisplay(rates);
            expect(result).toBeUndefined();
        });

        it('should handle rates object with undefined values', () => {
            const rates: Rates = {
                monthly: undefined,
                weekly: undefined,
                nightly: undefined
            };

            const result = getRateDisplay(rates);
            expect(result).toBeUndefined();
        });

        it('should handle mixed valid and invalid rate values', () => {
            const rates: Rates = {
                monthly: -1,      // Invalid
                weekly: 0,        // Valid
                nightly: 'abc' as any  // Invalid
            };

            const result = getRateDisplay(rates);
            expect(result).toBe('$0/wk');
        });

        it('should handle rates with extra properties', () => {
            const ratesWithExtras: any = {
                monthly: 2000,
                weekly: 500,
                nightly: 80,
                yearly: 20000,    // Extra property
                currency: 'USD'   // Extra property
            };

            const result = getRateDisplay(ratesWithExtras);
            expect(result).toBe('$2,000/mo');
        });

        it('should validate rate ranges', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const rates: Rates = {
                monthly: -100  // Negative rate should be invalid
            };

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('getRateDisplay: monthly rate is not a valid positive number');

            consoleSpy.mockRestore();
        });
    });
});
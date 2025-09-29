import { getRateDisplay } from "@/utils/get-rate-display";
import { Rates } from "@/types";

describe("getRateDisplay", () => {
    // Mock console methods to test warning/error logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Rate priority logic", () => {
        it("should prioritize monthly rate when all rates are present", () => {
            const rates: Rates = {
                monthly: 1000,
                weekly: 250,
                nightly: 50
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,000/mo");
        });

        it("should prioritize weekly rate when monthly is not available", () => {
            const rates: Rates = {
                weekly: 250,
                nightly: 50
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
        });

        it("should use nightly rate when only nightly is available", () => {
            const rates: Rates = {
                nightly: 50
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$50/night");
        });

        it("should prioritize monthly over weekly even when both are valid", () => {
            const rates: Rates = {
                monthly: 1200,
                weekly: 300
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,200/mo");
        });

        it("should prioritize weekly over nightly when both are valid", () => {
            const rates: Rates = {
                weekly: 280,
                nightly: 45
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$280/wk");
        });
    });

    describe("Number formatting", () => {
        it("should format large numbers with commas for monthly rate", () => {
            const rates: Rates = {
                monthly: 12500
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$12,500/mo");
        });

        it("should format large numbers with commas for weekly rate", () => {
            const rates: Rates = {
                weekly: 1250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,250/wk");
        });

        it("should format large numbers with commas for nightly rate", () => {
            const rates: Rates = {
                nightly: 1500
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,500/night");
        });

        it("should handle small numbers without commas", () => {
            const rates: Rates = {
                monthly: 99,
                weekly: 25,
                nightly: 5
            };

            // Should return monthly (highest priority)
            const result = getRateDisplay(rates);

            expect(result).toBe("$99/mo");
        });

        it("should handle decimal numbers correctly", () => {
            const rates: Rates = {
                monthly: 1000.50
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,000.5/mo");
        });

        it("should handle zero values", () => {
            const rates: Rates = {
                monthly: 0
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$0/mo");
        });
    });

    describe("Input validation", () => {
        it("should handle null rates parameter", () => {
            const result = getRateDisplay(null as any);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: rates parameter is null or undefined"
            );
        });

        it("should handle undefined rates parameter", () => {
            const result = getRateDisplay(undefined as any);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: rates parameter is null or undefined"
            );
        });

        it("should handle non-object rates parameter", () => {
            const result = getRateDisplay("not-an-object" as any);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: rates parameter is not an object"
            );
        });

        it("should handle number as rates parameter", () => {
            const result = getRateDisplay(123 as any);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: rates parameter is not an object"
            );
        });

        it("should handle array as rates parameter", () => {
            const result = getRateDisplay([1, 2, 3] as any);

            // Arrays are objects in JavaScript (typeof [] === "object")
            // So the function will try to access properties, but won't find valid rates
            expect(result).toBeUndefined();
            // No warning should be logged since arrays pass the object check
        });
    });

    describe("Invalid rate values", () => {
        it("should skip negative monthly rate and try weekly", () => {
            const rates: Rates = {
                monthly: -100,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: monthly rate is not a valid positive number"
            );
        });

        it("should skip negative weekly rate and try nightly", () => {
            const rates: Rates = {
                weekly: -50,
                nightly: 75
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$75/night");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: weekly rate is not a valid positive number"
            );
        });

        it("should skip negative nightly rate and return undefined", () => {
            const rates: Rates = {
                nightly: -25
            };

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: nightly rate is not a valid positive number"
            );
        });

        it("should skip non-number monthly rate values", () => {
            const rates = {
                monthly: "1000" as any,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: monthly rate is not a valid positive number"
            );
        });

        it("should skip non-number weekly rate values", () => {
            const rates = {
                weekly: "250" as any,
                nightly: 50
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$50/night");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: weekly rate is not a valid positive number"
            );
        });

        it("should skip non-number nightly rate values", () => {
            const rates = {
                nightly: "50" as any
            };

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: nightly rate is not a valid positive number"
            );
        });

        it("should skip Infinity values", () => {
            const rates: Rates = {
                monthly: Infinity,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: monthly rate is not a valid positive number"
            );
        });

        it("should skip NaN values", () => {
            const rates: Rates = {
                monthly: NaN,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: monthly rate is not a valid positive number"
            );
        });

        it("should skip null rate values", () => {
            const rates = {
                monthly: null as any,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
        });

        it("should skip undefined rate values", () => {
            const rates = {
                monthly: undefined,
                weekly: 250
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
        });
    });

    describe("Edge cases", () => {
        it("should return undefined when no valid rates are provided", () => {
            const rates: Rates = {};

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
        });

        it("should return undefined when all rates are invalid", () => {
            const rates = {
                monthly: -100,
                weekly: "invalid",
                nightly: NaN
            } as any;

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: monthly rate is not a valid positive number"
            );
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: weekly rate is not a valid positive number"
            );
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: nightly rate is not a valid positive number"
            );
        });

        it("should handle rates object with extra properties", () => {
            const rates = {
                monthly: 1000,
                weekly: 250,
                nightly: 50,
                extraProperty: "should be ignored",
                anotherExtra: 999
            } as any;

            const result = getRateDisplay(rates);

            expect(result).toBe("$1,000/mo");
        });

        it("should handle very large numbers", () => {
            const rates: Rates = {
                monthly: 999999999
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$999,999,999/mo");
        });

        it("should handle very small decimal numbers", () => {
            const rates: Rates = {
                monthly: 0.01
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$0.01/mo");
        });
    });

    describe("Locale formatting edge cases", () => {
        it("should handle toLocaleString errors gracefully for monthly rate", () => {
            const rates: Rates = {
                monthly: 1000
            };

            // Mock toLocaleString to throw an error
            const originalToLocaleString = Number.prototype.toLocaleString;
            Number.prototype.toLocaleString = jest.fn().mockImplementation(() => {
                throw new Error("Locale formatting failed");
            });

            const result = getRateDisplay(rates);

            expect(result).toBe("$1000/mo");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: error formatting monthly rate:",
                expect.any(Error)
            );

            // Restore original method
            Number.prototype.toLocaleString = originalToLocaleString;
        });

        it("should handle toLocaleString errors gracefully for weekly rate", () => {
            const rates: Rates = {
                weekly: 250
            };

            // Mock toLocaleString to throw an error
            const originalToLocaleString = Number.prototype.toLocaleString;
            Number.prototype.toLocaleString = jest.fn().mockImplementation(() => {
                throw new Error("Locale formatting failed");
            });

            const result = getRateDisplay(rates);

            expect(result).toBe("$250/wk");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: error formatting weekly rate:",
                expect.any(Error)
            );

            // Restore original method
            Number.prototype.toLocaleString = originalToLocaleString;
        });

        it("should handle toLocaleString errors gracefully for nightly rate", () => {
            const rates: Rates = {
                nightly: 75
            };

            // Mock toLocaleString to throw an error
            const originalToLocaleString = Number.prototype.toLocaleString;
            Number.prototype.toLocaleString = jest.fn().mockImplementation(() => {
                throw new Error("Locale formatting failed");
            });

            const result = getRateDisplay(rates);

            expect(result).toBe("$75/night");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getRateDisplay: error formatting nightly rate:",
                expect.any(Error)
            );

            // Restore original method
            Number.prototype.toLocaleString = originalToLocaleString;
        });
    });

    describe("General error handling", () => {
        it("should handle unexpected errors during processing", () => {
            // Create a rates object that will cause an error during property access
            const problematicRates = new Proxy({}, {
                get() {
                    throw new Error("Property access error");
                }
            }) as Rates;

            const result = getRateDisplay(problematicRates);

            expect(result).toBeUndefined();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getRateDisplay: error processing rates:",
                expect.any(Error)
            );
        });

        it("should handle rates object with getter that throws", () => {
            const rates = {
                get monthly() {
                    throw new Error("Getter error");
                },
                weekly: 250
            } as any;

            const result = getRateDisplay(rates);

            expect(result).toBeUndefined();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getRateDisplay: error processing rates:",
                expect.any(Error)
            );
        });
    });

    describe("Real-world scenarios", () => {
        it("should handle typical rental property rates", () => {
            const rates: Rates = {
                monthly: 2500,
                weekly: 650,
                nightly: 95
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$2,500/mo");
        });

        it("should handle vacation rental with only nightly rates", () => {
            const rates: Rates = {
                nightly: 150
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$150/night");
        });

        it("should handle extended stay rates", () => {
            const rates: Rates = {
                monthly: 3200,
                weekly: 850
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$3,200/mo");
        });

        it("should handle budget accommodation", () => {
            const rates: Rates = {
                nightly: 25,
                weekly: 150
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$150/wk");
        });

        it("should handle luxury property rates", () => {
            const rates: Rates = {
                monthly: 15000,
                weekly: 4000,
                nightly: 600
            };

            const result = getRateDisplay(rates);

            expect(result).toBe("$15,000/mo");
        });
    });

    describe("Type safety", () => {
        it("should accept valid Rates interface", () => {
            const rates: Rates = {
                monthly: 1000,
                weekly: 250,
                nightly: 50
            };

            const result = getRateDisplay(rates);

            expect(typeof result).toBe("string");
            expect(result).toBeDefined();
        });

        it("should handle optional properties in Rates interface", () => {
            const rates1: Rates = { monthly: 1000 };
            const rates2: Rates = { weekly: 250 };
            const rates3: Rates = { nightly: 50 };

            expect(getRateDisplay(rates1)).toBe("$1,000/mo");
            expect(getRateDisplay(rates2)).toBe("$250/wk");
            expect(getRateDisplay(rates3)).toBe("$50/night");
        });

        it("should return string or undefined", () => {
            const validRates: Rates = { monthly: 1000 };
            const invalidRates: Rates = {};

            const result1 = getRateDisplay(validRates);
            const result2 = getRateDisplay(invalidRates);

            expect(typeof result1 === "string" || result1 === undefined).toBe(true);
            expect(typeof result2 === "string" || result2 === undefined).toBe(true);
            expect(result1).toBe("$1,000/mo");
            expect(result2).toBeUndefined();
        });
    });

    describe("Performance", () => {
        it("should handle processing quickly for valid rates", () => {
            const rates: Rates = {
                monthly: 1000,
                weekly: 250,
                nightly: 50
            };

            const start = performance.now();
            const result = getRateDisplay(rates);
            const end = performance.now();

            expect(result).toBe("$1,000/mo");
            expect(end - start).toBeLessThan(10); // Should complete within 10ms
        });

        it("should process many rate objects efficiently", () => {
            const ratesArray = Array.from({ length: 1000 }, (_, i) => ({
                monthly: 1000 + i,
                weekly: 250 + i,
                nightly: 50 + i
            }));

            const start = performance.now();
            const results = ratesArray.map(rates => getRateDisplay(rates));
            const end = performance.now();

            expect(results).toHaveLength(1000);
            expect(results.every(result => typeof result === "string")).toBe(true);
            expect(end - start).toBeLessThan(100); // Should complete within 100ms
        });
    });
});
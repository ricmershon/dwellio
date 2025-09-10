/**
 * Get Viewport Width Tests
 * 
 * Section 6 of UTILS_TEST_PLAN
 * Tests viewport width retrieval from browser cookies for server-side responsive behavior
 */

// @ts-nocheck - Test file with Next.js cookies mocking

import { getViewportWidth } from "@/utils/get-viewport-width";

// Mock Next.js cookies
jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

// Mock types
jest.mock("@/types", () => ({
    VIEWPORT_WIDTH_COOKIE_NAME: "viewport_width",
}));

// Get the mocked function
import { cookies } from "next/headers";
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("getViewportWidth", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
        jest.clearAllMocks();
        console.warn = jest.fn();
        console.error = jest.fn();
        (process.env as any).NODE_ENV = 'development';
    });
    
    afterEach(() => {
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        if (originalNodeEnv !== undefined) {
            (process.env as any).NODE_ENV = originalNodeEnv;
        } else {
            delete (process.env as any).NODE_ENV;
        }
    });

    describe("Cookie Retrieval Tests", () => {
        it("should return number for valid viewport width cookie", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1920" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
            expect(mockCookieStore.get).toHaveBeenCalledWith("viewport_width");
        });

        it("should return 0 for missing cookie", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue(undefined)
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            // Should not log warning for missing cookie (normal case)
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should return 0 for cookie with no value", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: undefined })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return 0 for invalid cookie value", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "not-a-number" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: viewport cookie value is not a valid number:',
                'not-a-number'
            );
        });

        it("should return 0 for non-numeric cookie", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "abc123" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: viewport cookie value is not a valid number:',
                'abc123'
            );
        });
    });

    describe("Validation Tests", () => {
        it("should return 0 for negative width values", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "-100" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: negative viewport width detected:',
                -100
            );
        });

        it("should return 0 for zero width", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "0" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return correct values for reasonable width values", async () => {
            const reasonableWidths = ["320", "768", "1024", "1920", "2560"];
            
            for (const width of reasonableWidths) {
                const mockCookieStore = {
                    get: jest.fn().mockReturnValue({ value: width })
                };
                mockCookies.mockResolvedValue(mockCookieStore);

                const result = await getViewportWidth();
                expect(result).toBe(Number(width));
            }
        });

        it("should log warning but return value for suspiciously large width", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "15000" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(15000); // Still returns the value
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: suspiciously large viewport width detected:',
                15000
            );
        });
    });

    describe("Next.js Integration Tests", () => {
        it("should call cookies() API correctly", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1024" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            await getViewportWidth();

            expect(mockCookies).toHaveBeenCalledTimes(1);
            expect(mockCookieStore.get).toHaveBeenCalledWith("viewport_width");
        });

        it("should use VIEWPORT_WIDTH_COOKIE_NAME correctly", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "800" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            await getViewportWidth();

            expect(mockCookieStore.get).toHaveBeenCalledWith("viewport_width");
        });

        it("should handle null cookie store", async () => {
            mockCookies.mockResolvedValue(null);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: cookies() returned null or undefined'
            );
        });

        it("should handle undefined cookie store", async () => {
            mockCookies.mockResolvedValue(undefined);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: cookies() returned null or undefined'
            );
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle cookie access permission issues", async () => {
            mockCookies.mockRejectedValue(new Error("Cookie access denied"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith(
                'getViewportWidth: error retrieving viewport width:',
                expect.any(Error)
            );
        });

        it("should handle cookie parsing failures", async () => {
            const mockCookieStore = {
                get: jest.fn().mockImplementation(() => {
                    throw new Error("Cookie parsing failed");
                })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith(
                'getViewportWidth: error retrieving viewport width:',
                expect.any(Error)
            );
        });

        it("should suppress DYNAMIC_SERVER_USAGE errors in production", async () => {
            (process.env as any).NODE_ENV = "production";
            mockCookies.mockRejectedValue(new Error("DYNAMIC_SERVER_USAGE: server usage error"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in development", async () => {
            (process.env as any).NODE_ENV = "development";
            mockCookies.mockRejectedValue(new Error("Regular error"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith(
                'getViewportWidth: error retrieving viewport width:',
                expect.any(Error)
            );
        });

        it("should suppress errors in production for DYNAMIC_SERVER_USAGE", async () => {
            (process.env as any).NODE_ENV = "production";
            mockCookies.mockRejectedValue(new Error("DYNAMIC_SERVER_USAGE: production error"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in production", async () => {
            (process.env as any).NODE_ENV = "production";
            mockCookies.mockRejectedValue(new Error("Production network error"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith(
                'getViewportWidth: error retrieving viewport width:',
                expect.any(Error)
            );
        });

        it("should handle network failures", async () => {
            mockCookies.mockRejectedValue(new Error("Network connection failed"));

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });
    });

    describe("Server-Side Tests", () => {
        it("should work with various cookie value formats", async () => {
            const testCases = [
                { input: "1920", expected: 1920 },
                { input: "1920.0", expected: 1920 },
                { input: "1920.5", expected: 1920.5 },
                { input: "0", expected: 0 },
            ];

            for (const { input, expected } of testCases) {
                const mockCookieStore = {
                    get: jest.fn().mockReturnValue({ value: input })
                };
                mockCookies.mockResolvedValue(mockCookieStore);

                const result = await getViewportWidth();
                expect(result).toBe(expected);
            }
        });

        it("should handle cookie with non-string value type", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: 1920 }) // Number instead of string
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            // The actual code checks `typeof viewportCookie !== 'string'` and returns 0
            expect(result).toBe(0);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: viewport cookie value is not a string'
            );
        });

        it("should validate cookie name constant", async () => {
            // Mock missing VIEWPORT_WIDTH_COOKIE_NAME
            jest.doMock("@/types", () => ({
                VIEWPORT_WIDTH_COOKIE_NAME: undefined,
            }));

            // Reimport the function to get the updated constant
            jest.resetModules();
            const { getViewportWidth: testFunction } = await import("@/utils/get-viewport-width");

            const result = await testFunction();

            expect(result).toBe(0);
            // Note: This test might not work perfectly due to module caching
        });
    });

    describe("Edge Cases", () => {
        it("should handle decimal viewport widths", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1920.75" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(1920.75);
        });

        it("should handle scientific notation", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1.92e3" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle empty string cookie value", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should handle whitespace in cookie value", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: " 1920 " })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            expect(result).toBe(1920); // Number() trims whitespace
        });

        it("should handle Infinity values", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "Infinity" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const result = await getViewportWidth();

            // Infinity is > 10000 so it should log warning but still return
            expect(result).toBe(Infinity);
            expect(console.warn).toHaveBeenCalledWith(
                'getViewportWidth: suspiciously large viewport width detected:',
                Infinity
            );
        });
    });

    describe("Performance Tests", () => {
        it("should complete within reasonable time", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1920" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const startTime = performance.now();
            await getViewportWidth();
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(50); // Should be very fast
        });

        it("should handle multiple concurrent calls", async () => {
            const mockCookieStore = {
                get: jest.fn().mockReturnValue({ value: "1024" })
            };
            mockCookies.mockResolvedValue(mockCookieStore);

            const promises = Array.from({ length: 10 }, () => getViewportWidth());
            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            expect(results.every(result => result === 1024)).toBe(true);
        });
    });
});
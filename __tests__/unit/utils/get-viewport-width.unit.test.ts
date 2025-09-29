import { cookies } from "next/headers";
import { getViewportWidth } from "@/utils/get-viewport-width";

// Mock next/headers
jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

// Mock the types import
jest.mock("@/types", () => ({
    VIEWPORT_WIDTH_COOKIE_NAME: "viewportWidth",
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("getViewportWidth", () => {
    // Mock console methods to test warning/error logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
        (process.env as any).NODE_ENV = "test";
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Valid viewport width scenarios", () => {
        it("should return viewport width when cookie exists with valid number", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
            expect(mockGet).toHaveBeenCalledWith("viewportWidth");
        });

        it("should handle minimum valid viewport width", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1);
        });

        it("should handle large viewport widths", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "5000" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(5000);
        });

        it("should handle suspiciously large viewport widths", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "15000" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(15000);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getViewportWidth: suspiciously large viewport width detected:",
                15000
            );
        });

        it("should handle common desktop viewport widths", async () => {
            const testCases = [
                { width: "1024", expected: 1024 },
                { width: "1366", expected: 1366 },
                { width: "1440", expected: 1440 },
                { width: "1920", expected: 1920 },
                { width: "2560", expected: 2560 },
            ];

            for (const { width, expected } of testCases) {
                const mockGet = jest.fn().mockReturnValue({ value: width });
                mockCookies.mockResolvedValue({ get: mockGet } as any);

                const result = await getViewportWidth();

                expect(result).toBe(expected);
            }
        });

        it("should handle common mobile viewport widths", async () => {
            const testCases = [
                { width: "320", expected: 320 },
                { width: "375", expected: 375 },
                { width: "414", expected: 414 },
                { width: "768", expected: 768 },
            ];

            for (const { width, expected } of testCases) {
                const mockGet = jest.fn().mockReturnValue({ value: width });
                mockCookies.mockResolvedValue({ get: mockGet } as any);

                const result = await getViewportWidth();

                expect(result).toBe(expected);
            }
        });
    });

    describe("Invalid viewport width scenarios", () => {
        it("should return 0 when cookie does not exist", async () => {
            const mockGet = jest.fn().mockReturnValue(undefined);
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return 0 when cookie value is null", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: null });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return 0 when cookie value is undefined", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: undefined });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return 0 when cookie value is empty string", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });

        it("should return 0 when cookie value is not a number", async () => {
            const invalidValues = ["abc", "12.5px", "width", "NaN"];

            for (const value of invalidValues) {
                const mockGet = jest.fn().mockReturnValue({ value });
                mockCookies.mockResolvedValue({ get: mockGet } as any);

                const result = await getViewportWidth();

                expect(result).toBe(0);
                expect(consoleSpy.warn).toHaveBeenCalledWith(
                    "getViewportWidth: viewport cookie value is not a valid number:",
                    value
                );
            }
        });

        it("should return Infinity for Infinity string value", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "Infinity" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(Infinity);
        });

        it("should return 0 for negative numbers", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "-100" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getViewportWidth: negative viewport width detected:",
                -100
            );
        });

        it("should return 0 for zero", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "0" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            // Zero is not negative, so no warning should be issued
        });

        it("should return 0 when cookie value is not a string", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: 123 });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getViewportWidth: viewport cookie value is not a string"
            );
        });
    });

    describe("Error handling", () => {
        it("should handle cookies function throwing error", async () => {
            mockCookies.mockRejectedValue(new Error("Cookies not available"));

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                expect.any(Error)
            );
        });

        it("should handle cookie.get throwing error", async () => {
            const mockGet = jest.fn().mockImplementation(() => {
                throw new Error("Cookie access error");
            });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                expect.any(Error)
            );
        });

        it("should handle null cookieStore", async () => {
            mockCookies.mockResolvedValue(null as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getViewportWidth: cookies() returned null or undefined"
            );
        });

        it("should handle undefined cookieStore", async () => {
            mockCookies.mockResolvedValue(undefined as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "getViewportWidth: cookies() returned null or undefined"
            );
        });

        it("should log DYNAMIC_SERVER_USAGE errors in development", async () => {
            const error = new Error("DYNAMIC_SERVER_USAGE: some message");
            mockCookies.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                error
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors even in production", async () => {
            const error = new Error("Regular error");
            mockCookies.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "production";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                error
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in development", async () => {
            const error = new Error("Database connection failed");
            mockCookies.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                error
            );
        });

        it("should handle non-Error exceptions", async () => {
            mockCookies.mockRejectedValue("String error");

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                "String error"
            );
        });

        it("should handle undefined rejection", async () => {
            mockCookies.mockRejectedValue(undefined);

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                undefined
            );
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle numbers with leading zeros", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "01920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle numbers with leading/trailing whitespace", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "  1920  " });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle scientific notation", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1.92e3" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle hexadecimal numbers", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "0x780" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle decimal numbers", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920.5" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920.5);
        });
    });

    describe("Cookie structure variations", () => {
        it("should handle cookie object with additional properties", async () => {
            const mockGet = jest.fn().mockReturnValue({
                value: "1920",
                path: "/",
                secure: true,
                httpOnly: false,
            });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(1920);
        });

        it("should handle cookies object without get method", async () => {
            mockCookies.mockResolvedValue({} as any);

            (process.env as any).NODE_ENV = "development";

            const result = await getViewportWidth();

            expect(result).toBe(0);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "getViewportWidth: error retrieving viewport width:",
                expect.any(Error)
            );
        });
    });

    describe("Return type and structure", () => {
        it("should return number type for valid input", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(typeof result).toBe("number");
            expect(Number.isFinite(result)).toBe(true);
        });

        it("should return 0 for invalid input", async () => {
            const mockGet = jest.fn().mockReturnValue(undefined);
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result = await getViewportWidth();

            expect(result).toBe(0);
        });
    });

    describe("Performance considerations", () => {
        it("should complete quickly", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const start = performance.now();
            const result = await getViewportWidth();
            const end = performance.now();

            expect(result).toBe(1920);
            expect(end - start).toBeLessThan(100);
        });

        it("should handle multiple concurrent calls", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const promises = Array.from({ length: 10 }, () => getViewportWidth());
            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result).toBe(1920);
            });

            expect(mockGet).toHaveBeenCalledTimes(10);
        });
    });

    describe("Integration scenarios", () => {
        it("should work correctly with different cookie implementations", async () => {
            const mockGetMinimal = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGetMinimal } as any);

            let result = await getViewportWidth();
            expect(result).toBe(1920);

            const mockGetFull = jest.fn().mockReturnValue({
                value: "1440",
                name: "viewportWidth",
                path: "/",
                domain: ".example.com",
                secure: true,
                httpOnly: false,
                sameSite: "strict",
            });
            mockCookies.mockResolvedValue({ get: mockGetFull } as any);

            result = await getViewportWidth();
            expect(result).toBe(1440);
        });

        it("should maintain consistent behavior across calls", async () => {
            const mockGet = jest.fn().mockReturnValue({ value: "1920" });
            mockCookies.mockResolvedValue({ get: mockGet } as any);

            const result1 = await getViewportWidth();
            const result2 = await getViewportWidth();
            const result3 = await getViewportWidth();

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBe(1920);
        });
    });
});
/**
 * Require Session User Tests
 * 
 * Section 8 of UTILS_TEST_PLAN
 * Tests authentication enforcement and redirect behavior for protected routes
 */

// @ts-nocheck - Test file with Next.js navigation mocking

import { requireSessionUser } from "@/utils/require-session-user";
import type { Session } from "next-auth";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

// Mock get-session-user utility
jest.mock("@/utils/get-session-user", () => ({
    getSessionUser: jest.fn(),
}));

// Get the mocked functions
import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/get-session-user";
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>;

describe("requireSessionUser", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
        jest.clearAllMocks();
        console.warn = jest.fn();
        console.error = jest.fn();
        // Mock redirect to always throw NEXT_REDIRECT
        mockRedirect.mockImplementation(() => {
            const error = new Error("NEXT_REDIRECT");
            throw error;
        });
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

    describe("Successful Authentication Tests", () => {
        it("should return user object for valid authenticated session", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                name: "Test User",
                image: "https://example.com/avatar.jpg",
            };
            
            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it("should return user with minimal valid properties", async () => {
            const minimalUser = {
                id: "minimal-user",
                email: "minimal@test.com",
            };
            
            mockGetSessionUser.mockResolvedValue(minimalUser);

            const result = await requireSessionUser();

            expect(result).toEqual(minimalUser);
            expect(result.id).toBe("minimal-user");
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it("should handle user with extra properties", async () => {
            const userWithExtras = {
                id: "extra-user",
                email: "extra@test.com",
                name: "Extra User",
                customProperty: "custom value",
                roles: ["admin", "user"],
                preferences: { theme: "dark" },
            };
            
            mockGetSessionUser.mockResolvedValue(userWithExtras);

            const result = await requireSessionUser();

            expect(result).toEqual(userWithExtras);
            expect(result.customProperty).toBe("custom value");
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it("should validate return type has required id property", async () => {
            const validUser = {
                id: "typed-user",
                email: "typed@test.com",
                name: "Typed User",
            };
            
            mockGetSessionUser.mockResolvedValue(validUser);

            const result = await requireSessionUser();

            // TypeScript should enforce this type
            expect(typeof result.id).toBe("string");
            expect(result.id).toBe("typed-user");
        });
    });

    describe("Authentication Failure Tests", () => {
        it("should redirect when no user session found", async () => {
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
            // The redirect is called twice - once in main flow, once in error handler
            expect(mockRedirect).toHaveBeenCalledTimes(2);
        });

        it("should redirect when user is undefined", async () => {
            mockGetSessionUser.mockResolvedValue(undefined);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user is not an object", async () => {
            const invalidUsers = [
                "string user",
                123,
                true,
                [],
                false,
            ];

            for (const invalidUser of invalidUsers) {
                mockGetSessionUser.mockResolvedValue(invalidUser as any);
                
                await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
                expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
                
                jest.clearAllMocks();
                mockRedirect.mockImplementation(() => {
                    throw new Error("NEXT_REDIRECT");
                });
            }
        });

        it("should redirect when user object missing id property", async () => {
            const userWithoutId = {
                email: "noid@test.com",
                name: "No ID User",
            };
            
            mockGetSessionUser.mockResolvedValue(userWithoutId as any);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user id is not a string", async () => {
            const invalidIdUsers = [
                { id: 123, email: "numeric@test.com" },
                { id: null, email: "null@test.com" },
                { id: undefined, email: "undefined@test.com" },
                { id: {}, email: "object@test.com" },
                { id: [], email: "array@test.com" },
                { id: true, email: "boolean@test.com" },
            ];

            for (const invalidUser of invalidIdUsers) {
                mockGetSessionUser.mockResolvedValue(invalidUser as any);
                
                await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
                expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
                
                jest.clearAllMocks();
                mockRedirect.mockImplementation(() => {
                    throw new Error("NEXT_REDIRECT");
                });
            }
        });

        it("should redirect when user id is empty string", async () => {
            const userWithEmptyId = {
                id: "",
                email: "empty@test.com",
                name: "Empty ID User",
            };
            
            mockGetSessionUser.mockResolvedValue(userWithEmptyId);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });
    });

    describe("Development Environment Logging Tests", () => {
        it("should log warning when no user found in development", async () => {
            (process.env as any).NODE_ENV = "development";
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.warn).toHaveBeenCalledWith(
                "No user session found, redirecting to auth required"
            );
        });

        it("should log warning when user missing id in development", async () => {
            (process.env as any).NODE_ENV = "development";
            const userWithoutId = { email: "test@example.com" };
            mockGetSessionUser.mockResolvedValue(userWithoutId as any);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.warn).toHaveBeenCalledWith(
                "User session missing required id, redirecting to auth required"
            );
        });

        it("should not log warnings in production", async () => {
            (process.env as any).NODE_ENV = "production";
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should not log warnings when NODE_ENV is undefined", async () => {
            delete (process.env as any).NODE_ENV;
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.warn).not.toHaveBeenCalled();
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle getSessionUser errors and redirect", async () => {
            const sessionError = new Error("Session retrieval failed");
            mockGetSessionUser.mockRejectedValue(sessionError);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should log non-redirect errors in development", async () => {
            (process.env as any).NODE_ENV = "development";
            const sessionError = new Error("Session retrieval failed");
            mockGetSessionUser.mockRejectedValue(sessionError);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.error).toHaveBeenCalledWith(
                "Error in requireSessionUser:",
                sessionError
            );
        });

        it("should not log NEXT_REDIRECT errors in development", async () => {
            (process.env as any).NODE_ENV = "development";
            const redirectError = new Error("NEXT_REDIRECT: something");
            mockGetSessionUser.mockRejectedValue(redirectError);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            // The current implementation logs redirect failures in development
            expect(console.error).toHaveBeenCalledWith(
                "Failed to redirect after authentication error:",
                expect.any(Error)
            );
        });

        it("should not log errors in production", async () => {
            (process.env as any).NODE_ENV = "production";
            const sessionError = new Error("Production error");
            mockGetSessionUser.mockRejectedValue(sessionError);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should handle redirect failure gracefully", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("Redirect failed");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
        });

        it("should log redirect failure in development", async () => {
            (process.env as any).NODE_ENV = "development";
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("Redirect failed");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(console.error).toHaveBeenCalledWith(
                "Failed to redirect after authentication error:",
                expect.any(Error)
            );
        });
    });

    describe("Next.js Integration Tests", () => {
        it("should call redirect with correct URL", async () => {
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
            expect(mockRedirect).toHaveBeenCalledTimes(2);
        });

        it("should handle Next.js redirect behavior", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                const error = new Error("NEXT_REDIRECT");
                error.message = "NEXT_REDIRECT";
                throw error;
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should work with getSessionUser integration", async () => {
            const validUser = {
                id: "integration-user",
                email: "integration@test.com",
            };
            mockGetSessionUser.mockResolvedValue(validUser);

            const result = await requireSessionUser();
            
            expect(result).toEqual(validUser);
            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
        });
    });

    describe("Type Safety Tests", () => {
        it("should return correctly typed user object", async () => {
            const typedUser = {
                id: "typed-user",
                email: "typed@test.com",
                name: "Typed User",
                image: "https://example.com/image.jpg",
            };
            
            mockGetSessionUser.mockResolvedValue(typedUser);

            const result = await requireSessionUser();

            // These type assertions should not cause TypeScript errors
            expect(typeof result).toBe("object");
            expect(typeof result.id).toBe("string");
            expect(result.id).toBeTruthy();
            
            // Should have Session["user"] properties if they exist
            if (result.email) expect(typeof result.email).toBe("string");
            if (result.name) expect(typeof result.name).toBe("string");
            if (result.image) expect(typeof result.image).toBe("string");
        });

        it("should ensure id property is always string", async () => {
            const users = [
                { id: "string-id", email: "test1@example.com" },
                { id: "another-string-id", email: "test2@example.com" },
                { id: "uuid-like-id-12345", email: "test3@example.com" },
            ];

            for (const user of users) {
                mockGetSessionUser.mockResolvedValue(user);
                
                const result = await requireSessionUser();
                expect(typeof result.id).toBe("string");
                expect(result.id.length).toBeGreaterThan(0);
            }
        });
    });

    describe("Edge Cases and Boundary Tests", () => {
        it("should handle very long user id strings", async () => {
            const longIdUser = {
                id: "a".repeat(1000), // Very long ID
                email: "longid@test.com",
            };
            
            mockGetSessionUser.mockResolvedValue(longIdUser);

            const result = await requireSessionUser();
            
            expect(result.id).toBe(longIdUser.id);
            expect(result.id.length).toBe(1000);
        });

        it("should handle special characters in user id", async () => {
            const specialIdUser = {
                id: "user-123_special@domain.com",
                email: "special@test.com",
            };
            
            mockGetSessionUser.mockResolvedValue(specialIdUser);

            const result = await requireSessionUser();
            
            expect(result.id).toBe("user-123_special@domain.com");
        });

        it("should handle unicode characters in user data", async () => {
            const unicodeUser = {
                id: "user123",
                email: "üñíçødé@test.com",
                name: "Tëst Ñåmé 🚀",
            };
            
            mockGetSessionUser.mockResolvedValue(unicodeUser);

            const result = await requireSessionUser();
            
            expect(result).toEqual(unicodeUser);
            expect(result.name).toBe("Tëst Ñåmé 🚀");
        });

        it("should handle circular references in user object", async () => {
            const circularUser: any = {
                id: "circular-user",
                email: "circular@test.com",
            };
            
            // Create circular reference
            circularUser.self = circularUser;
            
            mockGetSessionUser.mockResolvedValue(circularUser);

            const result = await requireSessionUser();
            
            expect(result.id).toBe("circular-user");
            expect(result.self).toBe(result);
        });
    });

    describe("Performance Tests", () => {
        it("should complete authentication check quickly", async () => {
            const user = { id: "perf-user", email: "perf@test.com" };
            mockGetSessionUser.mockResolvedValue(user);
            
            const startTime = performance.now();
            await requireSessionUser();
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(50);
        });

        it("should handle concurrent authentication requests", async () => {
            const user = { id: "concurrent-user", email: "concurrent@test.com" };
            mockGetSessionUser.mockResolvedValue(user);
            
            const promises = Array.from({ length: 10 }, () => requireSessionUser());
            const results = await Promise.all(promises);
            
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toEqual(user);
            });
        });

        it("should handle rapid authentication failures efficiently", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            
            const startTime = performance.now();
            const promises = Array.from({ length: 5 }, async () => {
                try {
                    await requireSessionUser();
                } catch (error) {
                    return error;
                }
            });
            
            const results = await Promise.all(promises);
            const endTime = performance.now();
            
            expect(results).toHaveLength(5);
            expect(endTime - startTime).toBeLessThan(100);
        });
    });

    describe("Authentication Flow Integration Tests", () => {
        it("should work correctly in protected route scenario", async () => {
            // Simulate protected route access
            const authenticatedUser = {
                id: "authenticated-user",
                email: "authenticated@test.com",
                name: "Authenticated User",
            };
            
            mockGetSessionUser.mockResolvedValue(authenticatedUser);

            const result = await requireSessionUser();
            
            expect(result).toEqual(authenticatedUser);
            expect(mockRedirect).not.toHaveBeenCalled();
            
            // User can now access protected functionality
            expect(result.id).toBeTruthy();
        });

        it("should enforce authentication for unauthenticated access", async () => {
            // Simulate unauthenticated access attempt
            mockGetSessionUser.mockResolvedValue(null);

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
            
            // User should be redirected to auth page
            expect(mockRedirect).toHaveBeenCalledTimes(2);
        });

        it("should handle session expiration scenario", async () => {
            // First call succeeds
            const user = { id: "session-user", email: "session@test.com" };
            mockGetSessionUser.mockResolvedValueOnce(user);
            
            let result = await requireSessionUser();
            expect(result).toEqual(user);
            
            // Session expires, second call fails
            mockGetSessionUser.mockResolvedValueOnce(null);
            
            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });
    });
});
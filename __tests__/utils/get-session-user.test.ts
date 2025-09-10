/**
 * Get Session User Tests
 * 
 * Section 2 of UTILS_TEST_PLAN
 * Tests session retrieval and validation from NextAuth
 */

// @ts-nocheck - Test file with NODE_ENV modifications and type assertion

import { getSessionUser } from "@/utils/get-session-user";
import type { Session } from "next-auth";

// Mock NextAuth
jest.mock("next-auth/next", () => ({
    getServerSession: jest.fn(),
}));
jest.mock("@/config/auth-options", () => ({
    authOptions: { providers: [] },
}));

import { getServerSession } from "next-auth/next";
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;


describe("getSessionUser", () => {
    const originalConsoleError = console.error;
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        console.error = originalConsoleError;
        if (originalNodeEnv !== undefined) {
            (process.env as any).NODE_ENV = originalNodeEnv;
        } else {
            delete (process.env as any).NODE_ENV;
        }
    });

    describe("Session Retrieval Tests", () => {
        it("should return user object for valid session", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                name: "Test User",
            };
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toEqual(mockUser);
            expect(mockGetServerSession).toHaveBeenCalledWith(expect.objectContaining({
                providers: []
            }));
        });

        it("should return null when no session exists", async () => {
            mockGetServerSession.mockResolvedValue(null);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
            expect(mockGetServerSession).toHaveBeenCalled();
        });

        it("should return null for invalid session structure", async () => {
            mockGetServerSession.mockResolvedValue("invalid session" as any);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should return null when session with missing user property", async () => {
            const mockSession = {
                expires: "2024-12-31",
                // user property missing
            } as any;
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });
    });

    describe("User Validation Tests", () => {
        it("should return user object with valid id", async () => {
            const mockUser = {
                id: "valid-user-id",
                email: "user@test.com",
                name: "Valid User",
            };
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toEqual(mockUser);
        });

        it("should return null when user without id property", async () => {
            const mockUser = {
                email: "test@example.com",
                name: "Test User",
                // id property missing
            } as any;
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should return null when user with non-string id", async () => {
            const mockUser = {
                id: 123, // number instead of string
                email: "test@example.com",
                name: "Test User",
            } as any;
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should return null when user with empty string id", async () => {
            const mockUser = {
                id: "", // empty string
                email: "test@example.com",
                name: "Test User",
            };
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should return null when user is not an object", async () => {
            const mockSession = {
                user: "not an object",
                expires: "2024-12-31",
            } as any;
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });
    });

    describe("NextAuth Integration Tests", () => {
        it("should call getServerSession with correct authOptions", async () => {
            const mockSession: Session = {
                user: {
                    id: "user123",
                    email: "test@example.com",
                },
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            await getSessionUser();
            
            expect(mockGetServerSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    providers: []
                })
            );
            expect(mockGetServerSession).toHaveBeenCalledTimes(1);
        });

        it("should validate session object structure", async () => {
            // Test various invalid session structures
            const invalidSessions = [
                undefined,
                null,
                "string",
                123,
                [],
                true,
            ];
            
            for (const invalidSession of invalidSessions) {
                mockGetServerSession.mockResolvedValue(invalidSession as any);
                
                const result = await getSessionUser();
                expect(result).toBeNull();
            }
        });

        it("should ensure type safety of returned user object", async () => {
            const mockUser = {
                id: "typed-user",
                email: "typed@test.com",
                name: "Typed User",
                image: "https://example.com/avatar.jpg",
            };
            
            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            // TypeScript should enforce this, but we test runtime behavior
            expect(typeof result?.id).toBe("string");
            expect(result?.id).toBe("typed-user");
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle NextAuth configuration errors gracefully", async () => {
            mockGetServerSession.mockRejectedValue(new Error("Auth config error"));
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should handle network/database connectivity issues", async () => {
            mockGetServerSession.mockRejectedValue(new Error("Database connection failed"));
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should suppress DYNAMIC_SERVER_USAGE errors in production", async () => {
            (process.env as any).NODE_ENV = "production";
            
            const dynamicServerError = new Error("DYNAMIC_SERVER_USAGE: something something");
            mockGetServerSession.mockRejectedValue(dynamicServerError);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should log DYNAMIC_SERVER_USAGE errors in development (current behavior)", async () => {
            (process.env as any).NODE_ENV = "development";
            
            const dynamicServerError = new Error("DYNAMIC_SERVER_USAGE: dev error");
            mockGetServerSession.mockRejectedValue(dynamicServerError);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
            // Current implementation logs ALL errors in development, including DYNAMIC_SERVER_USAGE
            // This is documented as a code issue in CODE_ISSUES_FOUND.md
            expect(console.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                dynamicServerError
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in development", async () => {
            (process.env as any).NODE_ENV = "development";
            
            const regularError = new Error("Regular error");
            mockGetServerSession.mockRejectedValue(regularError);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                regularError
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in production", async () => {
            (process.env as any).NODE_ENV = "production";
            
            const regularError = new Error("Production error");
            mockGetServerSession.mockRejectedValue(regularError);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                regularError
            );
        });

        it("should handle session corruption scenarios", async () => {
            // Various corrupted session objects
            const corruptedSessions = [
                { user: null },
                { user: undefined },
                { user: { id: null } },
                { user: { id: undefined } },
                { user: { name: "User" } }, // missing id
                { expires: "invalid" }, // missing user
            ];
            
            for (const corruptedSession of corruptedSessions) {
                mockGetServerSession.mockResolvedValue(corruptedSession as any);
                
                const result = await getSessionUser();
                expect(result).toBeNull();
            }
        });
    });

    describe("Performance Tests", () => {
        it("should complete execution within acceptable time limits", async () => {
            const mockSession: Session = {
                user: {
                    id: "perf-test-user",
                    email: "perf@test.com",
                },
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const startTime = performance.now();
            await getSessionUser();
            const endTime = performance.now();
            
            // Should complete in under 100ms (generous for testing)
            expect(endTime - startTime).toBeLessThan(100);
        });

        it("should handle large session objects efficiently", async () => {
            const largeUserObject = {
                id: "large-user",
                email: "large@test.com",
                name: "Large User",
                // Add many properties to simulate large session
                ...Object.fromEntries(
                    Array.from({ length: 100 }, (_, i) => [`prop${i}`, `value${i}`])
                ),
            };
            
            const mockSession: Session = {
                user: largeUserObject,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            // Should still return the user object with all properties
            expect(result).toEqual(largeUserObject);
            expect(result?.id).toBe("large-user");
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined session gracefully", async () => {
            mockGetServerSession.mockResolvedValue(undefined as any);
            
            const result = await getSessionUser();
            
            expect(result).toBeNull();
        });

        it("should handle session with circular references", async () => {
            const circularSession: any = {
                user: {
                    id: "circular-user",
                    email: "circular@test.com",
                },
                expires: "2024-12-31",
            };
            
            // Create circular reference
            circularSession.user.session = circularSession;
            
            mockGetServerSession.mockResolvedValue(circularSession);
            
            const result = await getSessionUser();
            
            // Should still extract the user despite circular reference
            expect(result?.id).toBe("circular-user");
        });

        it("should validate user object with extra properties", async () => {
            const userWithExtras = {
                id: "extra-user",
                email: "extra@test.com",
                name: "Extra User",
                customProperty: "custom value",
                nestedObject: { prop: "value" },
                arrayProperty: [1, 2, 3],
            };
            
            const mockSession: Session = {
                user: userWithExtras,
                expires: "2024-12-31",
            };
            
            mockGetServerSession.mockResolvedValue(mockSession);
            
            const result = await getSessionUser();
            
            // Should return the entire user object with all properties
            expect(result).toEqual(userWithExtras);
        });
    });
});
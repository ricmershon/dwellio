import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { requireSessionUser } from "@/utils/require-session-user";
import { getSessionUser } from "@/utils/get-session-user";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

// Mock getSessionUser
jest.mock("@/utils/get-session-user", () => ({
    getSessionUser: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>;

describe("requireSessionUser", () => {
    // Mock console methods to test logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
        // Reset environment variable
        (process.env as any).NODE_ENV = "test";
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Valid session scenarios", () => {
        it("should return user when session is valid", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                name: "Test User",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(mockGetSessionUser).toHaveBeenCalled();
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it("should return user with minimal required properties", async () => {
            const mockUser = {
                id: "user456",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(result.id).toBe("user456");
        });

        it("should return user with additional properties", async () => {
            const mockUser = {
                id: "user789",
                email: "extended@example.com",
                name: "Extended User",
                image: "https://example.com/avatar.jpg",
                customField: "custom value",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(result.id).toBe("user789");
        });

        it("should preserve type safety with required id", async () => {
            const mockUser = {
                id: "type-safe-user",
                email: "type@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            // TypeScript should know that result.id is definitely a string
            expect(typeof result.id).toBe("string");
            expect(result.id.length).toBeGreaterThan(0);
        });
    });

    describe("Authentication failure scenarios", () => {
        it("should redirect when user is null", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user is undefined", async () => {
            mockGetSessionUser.mockResolvedValue(undefined as any);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user is not an object", async () => {
            mockGetSessionUser.mockResolvedValue("invalid user" as any);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user.id is missing", async () => {
            const mockUser = {
                email: "test@example.com",
                name: "Test User",
            } as any;

            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user.id is null", async () => {
            const mockUser = {
                id: null,
                email: "test@example.com",
            } as any;

            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user.id is not a string", async () => {
            const mockUser = {
                id: 123,
                email: "test@example.com",
            } as any;

            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should redirect when user.id is empty string", async () => {
            const mockUser = {
                id: "",
                email: "test@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });
    });

    describe("Logging behavior", () => {
        it("should log warning in development when no user session found", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "No user session found, redirecting to auth required"
            );
        });

        it("should log warning in development when user.id is missing", async () => {
            const mockUser = {
                email: "test@example.com",
            } as any;

            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "User session missing required id, redirecting to auth required"
            );
        });

        it("should not log warnings in production", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "production";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.warn).not.toHaveBeenCalled();
        });

        it("should not log warnings in test environment", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "test";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.warn).not.toHaveBeenCalled();
        });
    });

    describe("Error handling", () => {
        it("should handle getSessionUser errors and redirect", async () => {
            const error = new Error("Session retrieval failed");
            mockGetSessionUser.mockRejectedValue(error);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error in requireSessionUser:",
                error
            );
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should log redirect failures even for NEXT_REDIRECT errors", async () => {
            const error = new Error("NEXT_REDIRECT");
            mockGetSessionUser.mockRejectedValue(error);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Failed to redirect after authentication error:",
                expect.any(Error)
            );
        });

        it("should not log errors in production", async () => {
            const error = new Error("Session retrieval failed");
            mockGetSessionUser.mockRejectedValue(error);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "production";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.error).not.toHaveBeenCalled();
        });

        it("should handle redirect failure", async () => {
            const sessionError = new Error("Session failed");
            const redirectError = new Error("Redirect failed");

            mockGetSessionUser.mockRejectedValue(sessionError);
            mockRedirect.mockImplementation(() => {
                throw redirectError;
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow(
                "Authentication required but unable to redirect"
            );

            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error in requireSessionUser:",
                sessionError
            );
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Failed to redirect after authentication error:",
                redirectError
            );
        });

        it("should not log redirect failures in production", async () => {
            const sessionError = new Error("Session failed");
            const redirectError = new Error("Redirect failed");

            mockGetSessionUser.mockRejectedValue(sessionError);
            mockRedirect.mockImplementation(() => {
                throw redirectError;
            });

            (process.env as any).NODE_ENV = "production";

            await expect(requireSessionUser()).rejects.toThrow(
                "Authentication required but unable to redirect"
            );

            expect(consoleSpy.error).not.toHaveBeenCalled();
        });

        it("should handle non-Error exceptions", async () => {
            mockGetSessionUser.mockRejectedValue("String error");
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            (process.env as any).NODE_ENV = "development";

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error in requireSessionUser:",
                "String error"
            );
        });
    });

    describe("Redirect URL scenarios", () => {
        it("should always redirect to /?authRequired=true", async () => {
            mockGetSessionUser.mockResolvedValue(null);
            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
            expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
        });

        it("should use the same redirect URL for different failure scenarios", async () => {
            const scenarios = [
                () => mockGetSessionUser.mockResolvedValue(null),
                () => mockGetSessionUser.mockResolvedValue({ email: "test@example.com" } as any),
                () => mockGetSessionUser.mockResolvedValue({ id: "" } as any),
                () => mockGetSessionUser.mockRejectedValue(new Error("Session error")),
            ];

            mockRedirect.mockImplementation(() => {
                throw new Error("NEXT_REDIRECT");
            });

            for (const setupScenario of scenarios) {
                jest.clearAllMocks();
                setupScenario();

                await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");
                expect(mockRedirect).toHaveBeenCalledWith("/?authRequired=true");
            }
        });
    });

    describe("Return type and structure", () => {
        it("should return user with guaranteed id property", async () => {
            const mockUser = {
                id: "guaranteed-id",
                email: "guaranteed@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toHaveProperty("id");
            expect(typeof result.id).toBe("string");
            expect(result.id).toBe("guaranteed-id");
        });

        it("should return NonNullable<Session['user']> & { id: string }", async () => {
            const mockUser = {
                id: "type-test",
                email: "type@example.com",
                name: "Type Test",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(typeof result).toBe("object");
            expect(typeof result.id).toBe("string");
            expect(result.id.length).toBeGreaterThan(0);
        });

        it("should preserve all user properties from session", async () => {
            const mockUser = {
                id: "preserve-props",
                email: "preserve@example.com",
                name: "Preserve Test",
                image: "https://example.com/image.jpg",
                customProperty: "custom",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(result).toHaveProperty("customProperty", "custom");
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle user object with extra properties", async () => {
            const mockUser = {
                id: "extra-user",
                email: "extra@example.com",
                extraProperty: "should be preserved",
                nestedObject: { key: "value" },
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(result).toHaveProperty("extraProperty");
            expect(result).toHaveProperty("nestedObject.key", "value");
        });

        it("should handle very long user id", async () => {
            const longId = "a".repeat(1000);
            const mockUser = {
                id: longId,
                email: "long@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result.id).toBe(longId);
            expect(result.id).toHaveLength(1000);
        });

        it("should handle special characters in user id", async () => {
            const specialId = "user-123_test@domain.com#special!";
            const mockUser = {
                id: specialId,
                email: "special@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result.id).toBe(specialId);
        });

        it("should handle user with minimal properties", async () => {
            const mockUser = {
                id: "minimal-user",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result.id).toBe("minimal-user");
            expect(Object.keys(result)).toEqual(["id"]);
        });
    });

    describe("Integration scenarios", () => {
        it("should work with getSessionUser integration", async () => {
            const mockUser = {
                id: "integration-user",
                email: "integration@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUser);
        });

        it("should handle authentication flow correctly", async () => {
            // First call - no user (should redirect)
            mockGetSessionUser.mockResolvedValueOnce(null);
            mockRedirect.mockImplementationOnce(() => {
                throw new Error("NEXT_REDIRECT");
            });

            await expect(requireSessionUser()).rejects.toThrow("Authentication required but unable to redirect");

            // Second call - valid user (should succeed)
            const mockUser = {
                id: "auth-flow-user",
                email: "auth@example.com",
            };

            jest.clearAllMocks();
            mockGetSessionUser.mockResolvedValue(mockUser);

            const result = await requireSessionUser();

            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });
    });

    describe("Performance considerations", () => {
        it("should complete quickly for valid sessions", async () => {
            const mockUser = {
                id: "performance-user",
                email: "performance@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const start = performance.now();
            const result = await requireSessionUser();
            const end = performance.now();

            expect(result).toEqual(mockUser);
            expect(end - start).toBeLessThan(10); // Should complete within 10ms
        });

        it("should handle multiple concurrent calls", async () => {
            const mockUser = {
                id: "concurrent-user",
                email: "concurrent@example.com",
            };

            mockGetSessionUser.mockResolvedValue(mockUser);

            const promises = Array.from({ length: 5 }, () => requireSessionUser());
            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result).toEqual(mockUser);
            });

            expect(mockGetSessionUser).toHaveBeenCalledTimes(5);
        });
    });
});
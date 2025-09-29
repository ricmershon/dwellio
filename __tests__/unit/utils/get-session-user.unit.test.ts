import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { getSessionUser } from "@/utils/get-session-user";

// Mock next-auth
jest.mock("next-auth/next", () => ({
    getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock("@/config/auth-options", () => ({
    authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe("getSessionUser", () => {
    // Mock console methods to test logging
    const consoleSpy = {
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy.error.mockClear();
        // Reset environment variable
        (process.env as any).NODE_ENV = "test";
    });

    afterAll(() => {
        consoleSpy.error.mockRestore();
    });

    describe("Valid session scenarios", () => {
        it("should return user when session is valid", async () => {
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
            expect(mockGetServerSession).toHaveBeenCalledWith({});
        });

        it("should return user with minimal required properties", async () => {
            const mockUser = {
                id: "user456",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });

        it("should return user with additional properties", async () => {
            const mockUser = {
                id: "user789",
                email: "extended@example.com",
                name: "Extended User",
                image: "https://example.com/avatar.jpg",
                customField: "custom value",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });
    });

    describe("Invalid session scenarios", () => {
        it("should return null when session is null", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session is undefined", async () => {
            mockGetServerSession.mockResolvedValue(undefined);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session is not an object", async () => {
            mockGetServerSession.mockResolvedValue("invalid session" as any);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session is an array", async () => {
            mockGetServerSession.mockResolvedValue([] as any);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session.user is missing", async () => {
            const mockSession = {
                expires: "2024-12-31",
            } as Session;

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session.user is null", async () => {
            const mockSession = {
                user: null,
                expires: "2024-12-31",
            } as any;

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when session.user is not an object", async () => {
            const mockSession = {
                user: "invalid user",
                expires: "2024-12-31",
            } as any;

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });
    });

    describe("Invalid user scenarios", () => {
        it("should return null when user.id is missing", async () => {
            const mockSession: Session = {
                user: {
                    email: "test@example.com",
                    name: "Test User",
                } as any,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when user.id is null", async () => {
            const mockSession: Session = {
                user: {
                    id: null,
                    email: "test@example.com",
                } as any,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when user.id is not a string", async () => {
            const mockSession: Session = {
                user: {
                    id: 123,
                    email: "test@example.com",
                } as any,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });

        it("should return null when user.id is empty string", async () => {
            const mockSession: Session = {
                user: {
                    id: "",
                    email: "test@example.com",
                },
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeNull();
        });
    });

    describe("Error handling", () => {
        it("should handle getServerSession errors and return null", async () => {
            const error = new Error("Session retrieval failed");
            mockGetServerSession.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "development";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                error
            );
        });

        it("should log DYNAMIC_SERVER_USAGE errors in development", async () => {
            const error = new Error("DYNAMIC_SERVER_USAGE: some message");
            mockGetServerSession.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "development";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                error
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors even in production", async () => {
            const error = new Error("Session retrieval failed");
            mockGetServerSession.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "production";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                error
            );
        });

        it("should log non-DYNAMIC_SERVER_USAGE errors in development", async () => {
            const error = new Error("Database connection failed");
            mockGetServerSession.mockRejectedValue(error);

            (process.env as any).NODE_ENV = "production";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                error
            );
        });

        it("should handle non-Error exceptions", async () => {
            mockGetServerSession.mockRejectedValue("String error");

            (process.env as any).NODE_ENV = "development";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                "String error"
            );
        });

        it("should handle undefined rejection", async () => {
            mockGetServerSession.mockRejectedValue(undefined);

            (process.env as any).NODE_ENV = "development";

            const result = await getSessionUser();

            expect(result).toBeNull();
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "Error retrieving session user:",
                undefined
            );
        });
    });

    describe("Environment-specific behavior", () => {
        it("should work correctly in test environment", async () => {
            const mockUser = {
                id: "test-user",
                email: "test@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);
            (process.env as any).NODE_ENV = "test";

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });

        it("should work correctly in development environment", async () => {
            const mockUser = {
                id: "dev-user",
                email: "dev@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);
            (process.env as any).NODE_ENV = "development";

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });

        it("should work correctly in production environment", async () => {
            const mockUser = {
                id: "prod-user",
                email: "prod@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);
            (process.env as any).NODE_ENV = "production";

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });
    });

    describe("Return type and structure", () => {
        it("should return Session['user'] type", async () => {
            const mockUser = {
                id: "type-test-user",
                email: "type@example.com",
                name: "Type Test",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
            expect(result).toHaveProperty("id");
            expect(typeof result?.id).toBe("string");
        });

        it("should preserve all user properties", async () => {
            const mockUser = {
                id: "preserve-test",
                email: "preserve@example.com",
                name: "Preserve Test",
                image: "https://example.com/image.jpg",
                customProperty: "custom value",
                nestedObject: {
                    key: "value",
                },
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
            expect(result).toHaveProperty("customProperty", "custom value");
            expect(result).toHaveProperty("nestedObject.key", "value");
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle session with extra properties", async () => {
            const mockUser = {
                id: "extra-props-user",
                email: "extra@example.com",
            };

            const mockSession = {
                user: mockUser,
                expires: "2024-12-31",
                extraProperty: "should be ignored",
                anotherExtra: 123,
            } as any;

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
        });

        it("should handle very long user id", async () => {
            const longId = "a".repeat(1000);
            const mockUser = {
                id: longId,
                email: "long@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
            expect(result?.id).toHaveLength(1000);
        });

        it("should handle special characters in user id", async () => {
            const specialId = "user-123_test@domain.com#special";
            const mockUser = {
                id: specialId,
                email: "special@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const result = await getSessionUser();

            expect(result).toEqual(mockUser);
            expect(result?.id).toBe(specialId);
        });
    });

    describe("Performance considerations", () => {
        it("should handle multiple concurrent calls", async () => {
            const mockUser = {
                id: "concurrent-user",
                email: "concurrent@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const promises = Array.from({ length: 10 }, () => getSessionUser());
            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result).toEqual(mockUser);
            });

            expect(mockGetServerSession).toHaveBeenCalledTimes(10);
        });

        it("should complete quickly", async () => {
            const mockUser = {
                id: "performance-user",
                email: "performance@example.com",
            };

            const mockSession: Session = {
                user: mockUser,
                expires: "2024-12-31",
            };

            mockGetServerSession.mockResolvedValue(mockSession);

            const start = performance.now();
            const result = await getSessionUser();
            const end = performance.now();

            expect(result).toEqual(mockUser);
            expect(end - start).toBeLessThan(10); // Should complete within 10ms
        });
    });
});
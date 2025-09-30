import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("@/lib/db-connect");
jest.mock("@/models");
jest.mock("@/utils/password-utils");

import { createCredentialsUser } from "@/lib/actions/user-actions";
import { ActionStatus } from "@/types";
import { hashPassword, validatePassword } from "@/utils/password-utils";
import { User } from "@/models";
// Test data
const validUserFormData = {
    email: "test@example.com",
    password: "validPassword123!",
    username: "testuser123"
};

const mockHashedPassword = "hashedPassword123456789";

// Helper function
const createFormDataFromObject = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    const appendToFormData = (obj: Record<string, any>, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
                appendToFormData(value, formKey);
            } else if (Array.isArray(value)) {
                value.forEach(item => formData.append(formKey, item));
            } else if (value !== undefined && value !== null) {
                formData.append(formKey, value.toString());
            }
        }
    };

    appendToFormData(data);
    return formData;
};

// Mock implementations
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;

// Mock mongoose model methods
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserSave = jest.fn();

const mockUser = User as jest.MockedClass<any>;

describe("user-actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockUser.findOne = mockUserFindOne;
        mockUser.create = mockUserCreate;

        (mockHashPassword as any).mockResolvedValue(mockHashedPassword);
        mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
        (mockUserFindOne as any).mockResolvedValue(null as any);
        (mockUserCreate as any).mockResolvedValue({
            _id: "user123",
            email: validUserFormData.email.toLowerCase(),
            username: validUserFormData.username,
            passwordHash: mockHashedPassword,
            image: null
        } as any);
    });

    describe("createCredentialsUser", () => {
        const createFormData = (data: Partial<typeof validUserFormData> = {}) => {
            return createFormDataFromObject({ ...validUserFormData, ...data });
        };

        describe("successful user creation", () => {
            it("should create new user with valid credentials", async () => {
                const formData = createFormData();

                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.SUCCESS,
                    message: "Account created successfully.",
                    userId: "user123",
                    isAccountLinked: false,
                    canSignInWith: ["credentials"],
                    email: validUserFormData.email,
                    password: validUserFormData.password,
                    shouldAutoLogin: true
                });

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: validUserFormData.username,
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should create user without username (use email prefix)", async () => {
                const formData = new FormData();
                formData.append("email", "newuser@example.com");
                formData.append("password", "validPassword123!");

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: "newuser@example.com",
                    username: "newuser",
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should trim username before using", async () => {
                const formData = createFormData({ username: "  testuser  " });

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: "testuser",
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should convert email to lowercase", async () => {
                const formData = createFormData({ email: "TEST@EXAMPLE.COM" });

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        email: "test@example.com"
                    })
                );
            });
        });

        describe("input validation", () => {
            it("should return error if email is missing", async () => {
                const formData = createFormData({ email: "" });

                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Email and password are required."
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should return error if password is missing", async () => {
                const formData = createFormData({ password: "" });

                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Email and password are required."
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should return error for invalid email format", async () => {
                const formData = createFormData({ email: "invalid-email" });

                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Please enter a valid email address."
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should return error for invalid password", async () => {
                mockValidatePassword.mockReturnValue({
                    isValid: false,
                    errors: ["Password must be at least 8 characters", "Password must contain uppercase letter"]
                });
                const formData = createFormData();

                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Password must be at least 8 characters Password must contain uppercase letter"
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should handle various invalid email formats", async () => {
                const invalidEmails = [
                    "email@",
                    "@domain.com",
                    "email.domain",
                    "email space@domain.com",
                    "email@@domain.com"
                ];

                for (const email of invalidEmails) {
                    const formData = createFormData({ email });
                    const result = await createCredentialsUser({}, formData);

                    expect(result.status).toBe(ActionStatus.ERROR);
                    expect(result.message).toBe("Please enter a valid email address.");
                }
            });
        });

        describe("existing user scenarios", () => {
            it("should return error if user already exists with credentials", async () => {
                const existingUser = {
                    email: validUserFormData.email,
                    passwordHash: "existingHash",
                    username: "existing"
                };
                (mockUserFindOne as any).mockResolvedValue(existingUser);

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: `An account with the email "${validUserFormData.email}" already exists.`
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should link password to existing OAuth user", async () => {
                const oAuthUser = {
                    _id: "oauth123",
                    email: validUserFormData.email,
                    username: "oauthuser",
                    passwordHash: null, // OAuth user without password
                    save: mockUserSave
                };
                (mockUserFindOne as any).mockResolvedValue(oAuthUser);
                (mockUserSave as any).mockResolvedValue(oAuthUser);

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(oAuthUser.passwordHash).toBe(mockHashedPassword);
                expect(mockUserSave).toHaveBeenCalled();
                expect(result).toEqual({
                    status: ActionStatus.SUCCESS,
                    userId: "oauth123",
                    message: "Password successfully added to your existing Google account. You can now sign in with either method.",
                    isAccountLinked: true,
                    canSignInWith: ["google", "credentials"],
                    email: validUserFormData.email,
                    password: validUserFormData.password,
                    shouldAutoLogin: true
                });
            });

            it("should update username when linking OAuth account", async () => {
                const oAuthUser = {
                    _id: "oauth123",
                    email: validUserFormData.email,
                    username: "oldusername",
                    passwordHash: null,
                    save: mockUserSave
                };
                (mockUserFindOne as any)
                    .mockResolvedValueOnce(oAuthUser) // First call to find existing user
                    .mockResolvedValueOnce(null); // Second call to check username availability

                const formData = createFormData({ username: "newusername" });
                await createCredentialsUser({}, formData);

                expect(oAuthUser.username).toBe("newusername");
                expect(mockUserSave).toHaveBeenCalled();
            });

            it("should not update username if already taken", async () => {
                const oAuthUser = {
                    _id: "oauth123",
                    email: validUserFormData.email,
                    username: "oldusername",
                    passwordHash: null,
                    save: mockUserSave
                };
                (mockUserFindOne as any)
                    .mockResolvedValueOnce(oAuthUser) // First call to find existing user
                    .mockResolvedValueOnce({ _id: "other" }); // Second call shows username taken

                const formData = createFormData({ username: "takenusername" });
                await createCredentialsUser({}, formData);

                expect(oAuthUser.username).toBe("oldusername"); // Should remain unchanged
                expect(mockUserSave).toHaveBeenCalled();
            });

            it("should handle invalid password when linking OAuth account", async () => {
                const oAuthUser = {
                    email: validUserFormData.email,
                    passwordHash: null
                };
                (mockUserFindOne as any).mockResolvedValue(oAuthUser);
                mockValidatePassword.mockReturnValue({
                    isValid: false,
                    errors: ["Password too weak"]
                });

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Password too weak"
                });
                expect(mockUserSave).not.toHaveBeenCalled();
            });
        });

        describe("username handling", () => {
            it("should return error if username is already taken", async () => {
                (mockUserFindOne as any)
                    .mockResolvedValueOnce(null) // No existing user with email
                    .mockResolvedValueOnce({ username: "testuser" }); // Username exists

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: 'Username "testuser123" is already taken.'
                });
                expect(mockUserCreate).not.toHaveBeenCalled();
            });

            it("should handle empty username gracefully", async () => {
                const formData = createFormData({ username: "" });

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: "test", // From email prefix
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should handle whitespace-only username", async () => {
                const formData = createFormData({ username: "   " });

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: "test", // From email prefix
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });
        });

        describe("error handling", () => {
            it("should handle database connection errors", async () => {
                (mockUserFindOne as any).mockRejectedValue(new Error("Database connection failed"));

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it("should handle password hashing errors", async () => {
                (mockHashPassword as any).mockRejectedValue(new Error("Hashing failed"));

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it("should handle user creation errors", async () => {
                (mockUserCreate as any).mockRejectedValue(new Error("User creation failed"));

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it("should handle OAuth user save errors", async () => {
                const oAuthUser = {
                    _id: "oauth123",
                    email: validUserFormData.email,
                    passwordHash: null,
                    save: mockUserSave
                };
                (mockUserFindOne as any).mockResolvedValue(oAuthUser);
                (mockUserSave as any).mockRejectedValue(new Error("Save failed"));

                const formData = createFormData();
                const result = await createCredentialsUser({}, formData);

                expect(result).toEqual({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });
        });

        describe("edge cases", () => {
            it("should handle null username in form data", async () => {
                const formData = new FormData();
                formData.append("email", validUserFormData.email);
                formData.append("password", validUserFormData.password);
                // username is null/undefined

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: "test", // From email prefix
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should handle complex email addresses", async () => {
                const complexEmail = "user.name+tag@sub.domain.co.uk";
                const formData = new FormData();
                formData.append("email", complexEmail);
                formData.append("password", "validPassword123!");
                // Don't provide username, so it uses email prefix

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: complexEmail.toLowerCase(),
                    username: "user.name+tag", // From email prefix
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should handle very long usernames", async () => {
                const longUsername = "a".repeat(100);
                const formData = createFormData({ username: longUsername });

                await createCredentialsUser({}, formData);

                expect(mockUserCreate).toHaveBeenCalledWith({
                    email: validUserFormData.email.toLowerCase(),
                    username: longUsername,
                    passwordHash: mockHashedPassword,
                    image: null
                });
            });

            it("should handle special characters in email", async () => {
                const specialEmail = "user+test@example-domain.com";
                const formData = createFormData({ email: specialEmail });

                await createCredentialsUser({}, formData);

                expect(mockUserFindOne).toHaveBeenCalledWith({ email: specialEmail.toLowerCase() });
            });
        });
    });
});
import { hash, compare } from "bcryptjs";

import { PasswordValidation } from "@/types";

/**
 * Hash a password.
 * 
 * @param {string} password - clean password provided by user.
 * @returns promise resolved to hashed password string.
 */
export const hashPassword = async (password: string) => {
    const saltRounds = 12;
    return await hash(password, saltRounds);
}

/**
 * Verifies password against its hash.
 * 
 * @param {string} password provided by user.
 * @param {string} hashedPassword from database.
 * @returns promise resolved to boolean.
 */
export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await compare(password, hashedPassword);
}

/**
 * Validate password strength requirements.
 * 
 * @param {string} password provided by user.
 * @returns {PasswordValidation} object containing validation status.
 */
export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
    }

    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter.');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
    }

    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number.');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&).');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

/**
 * Generate a secure random username from email.
 * 
 * @param {string} email address.
 * @returns {string} - randomized username.
 */
export const generateUsername = (email: string) => {
    const baseUsername = email.split('@')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return `${baseUsername}_${randomSuffix}`
}
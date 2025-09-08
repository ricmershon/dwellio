import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	rootDir: './',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', {
			tsconfig: {
				jsx: 'react-jsx',
			},
		}],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	moduleNameMapper: {
		'\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
		'^@/(.*)$': '<rootDir>/$1',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'react-toastify/dist/ReactToastify.css': 'identity-obj-proxy',
		'react-loading-skeleton/dist/skeleton.css': 'identity-obj-proxy',
		'photoswipe/dist/photoswipe.css': 'identity-obj-proxy',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(jose|openid-client|next-auth)/).*'
	],
	testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/__tests__/coverage/'],
	testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
	collectCoverageFrom: [
		'app/**/*.{ts,tsx}',
		'ui/**/*.{ts,tsx}',
		'lib/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	coverageDirectory: '__tests__/coverage',
};

export default config;
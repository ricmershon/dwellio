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
		'^@/(.*)$': '<rootDir>/$1',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'react-toastify/dist/ReactToastify.css': 'identity-obj-proxy',
		'react-loading-skeleton/dist/skeleton.css': 'identity-obj-proxy',
		'photoswipe/dist/photoswipe.css': 'identity-obj-proxy',
	},
	transformIgnorePatterns: [
		'node_modules/(?!.*\\.(js|jsx|ts|tsx|css)$)'
	],
	testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
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
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
	},
	testEnvironmentOptions: {
		NODE_ENV: 'test',
	},
	restoreMocks: true,
	coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.ts', 'tests'],
	coverageReporters: ['text', 'lcov', 'clover', 'html'],
};

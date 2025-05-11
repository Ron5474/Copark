import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      'build*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/**'
      ],
      exclude: [
        '**/index.ts',
        '**/index.d.ts',
        'src/server.ts',
        'src/db.ts'
    ],
    },
  },
});
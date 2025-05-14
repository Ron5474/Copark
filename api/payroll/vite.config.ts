import {defineConfig, configDefaults} from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    exclude:[
      ...configDefaults.exclude, 
      'build/*'
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/**',
        'test/**',
      ],
      exclude: [
        'test/mockService.ts',
        'src/server.ts',
        '**/index.ts',
        '**/index.d.ts',
      ],
    },
  },
});
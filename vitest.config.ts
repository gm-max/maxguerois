import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Scoped to src/ on purpose. Vitest's default glob walks the whole working
    // directory, which drags in .claude/skills/gstack — a gitignored symlink to
    // ~/.claude holding ~692 Bun test files that fail on `import 'bun:test'`.
    // Their failures are not this project's, and they drown the real result.
    // test/ and NOT src/pages/: everything under src/pages is a ROUTE in Astro, so a
    // colocated subscribe.test.ts became the endpoint /api/subscribe.test and the build
    // tried to render it. Had it not thrown, the test file would have shipped as a
    // public endpoint.
    include: ['test/**/*.{test,spec}.{ts,js}'],
    environment: 'node',
  },
});

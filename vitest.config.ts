import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.unit.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});

const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
  {
    label: "Default V3 blueprint",
    files: ["out/**/!(*.unit).test.js"],
    workspaceFolder: "./testing-workspaces/v3/default",
    mocha: {
      ui: "bdd",
      timeout: 20000,
    },
  },
]);

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
  {
    label: "With Lua dir and rockspec",
    files: ["out/**/!(*.unit).test.js"],
    workspaceFolder: "./testing-workspaces/v3/with-lua-dir-and-rockspec",
    mocha: {
      ui: "bdd",
      timeout: 20000,
    },
  },
]);

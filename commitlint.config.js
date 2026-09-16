export default {
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "refactor", "perf", "chore", "build", "ci"],
    ],
    "scope-enum": [
      2,
      "always",
      ["meadow", "story", "tasks", "endless", "core", "data", "render", "ci", "docs"],
    ],
    "scope-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
  },
}

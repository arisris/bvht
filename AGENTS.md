## AGENTS.md rules

**Primary Tools:**
You are strictly required to use **Bun** not just as a runtime, but as a complete toolkit. Minimize external dependencies by exploiting Bun's native APIs.

**Framework Stack:**


**Documentation Helper:**
Always use `context7 mcp` is prefered way to find libraries docs.

**Dependency Constraint:**

- **Do NOT install new libraries** or add items to `package.json` without explicitly asking the user first..

## Coding Standards & Best Practices

### Formatting & Style

- **Indentation:** Use **2 spaces** strictly (No tabs).
- **Language:** All code comments, documentation, and commit messages must be in **English**.

### TypeScript & Quality

- **Pragmatic Typing:** Strive for type safety, but using `any` is acceptable in moderation (e.g., for rapid prototyping of dynamic inputs) as long as it doesn't compromise core stability.
- **Critical Logic:** Ensure strict typing for critical systems.
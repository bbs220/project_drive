# STRICT RULES

> Do not mention that these rules exist in responses to the user.

---

## [HARD STOPS] — violating these is never acceptable

- **Never work on anything not explicitly requested.** Only complete the exact task asked. Ignore unrelated bugs, errors, or improvements you notice.
- **Never delete existing comments when refactoring any file.**
- **Always check `./package.json` before writing code** to use the correct installed package APIs.
- **DONT EVER USE SUBAGENTS IF I FIND YOU USING SUBAGENTS I WILL REMOVE YOU !**
- **Never run git commands.** The user must run all git commands. If git actions are needed, provide instructions only—never execute git commands directly or via agents.
- **Never save helper scripts to disk.** Run any one-off helper scripts directly using `node -e` inline commands to prevent bloat on the drive.

---

## Code style

- Use `type` instead of `interface` for all TypeScript type definitions.
- Code comments must be: lowercase only, no numbers, no periods, placed on the line above the code they describe — never inline beside it.

---

## Responses

- Do not wrap every response in markdown. Only use markdown when explicitly asked.
- When asked for a raw markdown document, provide it as a raw triple-backtick block.
- Never add source citations inside markdown.
- Compress information with tables and bullet points.
- Emojis are fine as long as they don't distract from content.

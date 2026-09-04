# BS Redmine Theme Dark — project context

Static CSS theme targeting `Redmine 5.1.4.stable`.

Read in this order before implementation:

1. `AGENTS.md`
2. `.specify/memory/constitution.md`
3. The active `.specify/specs/<number>-<feature>/spec.md`
4. The matching `plan.md` and `tasks.md`
5. `docs/ARCHITECTURE.md` and `docs/COMPATIBILITY.md` as needed

Use `.claude/skills/specdrive/SKILL.md` for the spec-driven workflow and
`.agents/skills/redmine-theme-development/SKILL.md` for theme-specific work.
Validate with `ruby scripts/validate_theme.rb` and
`npx --yes csstree-validator@4.0.1 stylesheets`, then run
`node --check javascripts/theme.js` and
`node --test tests/*.js`.

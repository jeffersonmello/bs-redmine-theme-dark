# Plan — Redmine 5.1.4 compatibility baseline

## Technical approach

1. Inventory tracked files, CSS imports, selectors, local URLs, fonts, images,
   plugin rules, and historical compatibility claims.
2. Compare theme integration paths and referenced core assets with the immutable
   upstream Redmine `5.1.4` tag.
3. Correct only verified compatibility defects, preserving the established
   visual design and static deployment model.
4. Add a Ruby standard-library validator for structure, import order, local and
   core assets, Font Awesome glyph availability, balanced CSS blocks, and target
   version evidence.
5. Add a pinned CSS grammar/value check in CI.
6. Record architecture, compatibility boundaries, contribution workflow,
   third-party notices, and installation instructions.
7. Add repository-wide and path-specific instructions, implementation and
   review agents, a domain skill, and SpecDrive context.
8. Validate locally and against the official `redmine:5.1.4` container image;
   keep visual checks explicitly pending until exercised in a browser.

## Files and ownership

- Runtime: `stylesheets/`, `images/`, `webfonts/`, `javascripts/theme.js`
- Validation: `scripts/validate_theme.rb`, `.github/workflows/validate.yml`
- Public docs: `README.md`, `CONTRIBUTING.md`, `docs/`, notices
- Agent context: `AGENTS.md`, `CLAUDE.md`, `.github/`, `.agents/`, `.claude/`
- Specs: `.specify/`

## Risks and controls

- **Cascade regression:** enforce import order and keep narrow overrides last.
- **Wrong Redmine generation:** check an exact 5.1.4 version file when a Redmine
  root is supplied.
- **Missing glyph or image:** validate all CSS URLs and Font Awesome codepoints.
- **False plugin assurance:** label selector coverage separately from tested
  compatibility.
- **Visual blind spots:** retain a manual page and viewport matrix.


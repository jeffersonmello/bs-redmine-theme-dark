---
applyTo: "stylesheets/**/*.css"
---

# CSS instructions

- Preserve the import order in `stylesheets/application.css`: Redmine core,
  legacy-compatible base, modern base, active plugin overrides, late custom
  overrides.
- Verify every changed selector against Redmine `5.1.4` markup or an installed
  `5.1.4.stable` instance.
- Use `../images/` for theme-owned images and `../../../images/` for assets from
  the Redmine 5.1.4 core.
- Keep rules grouped by responsibility. Do not move plugin-specific selectors
  into the base theme.
- Add refreshed shared presentation to `modern.css`; do not duplicate its
  design tokens with new hard-coded palette values.
- Keep the `tm-clientes-*` autocomplete presentation in `modern.css`; the
  JavaScript must not carry inline theme colors.
- Keep `#history`, `#activity`, and `.theme-lightbox` presentation in
  `modern.css`. Scope journal note selectors to the exact 5.1.4 `.note`
  children so contextual controls do not inherit comment-card styles.
- Keep `.theme-issue-timer` presentation in `modern.css`, retain a visible
  distinction between start, running, focus, and storage-error states, and
  verify duplicated contextual menus plus the layout below 899 px.
- Avoid adding `!important` unless overriding Redmine or plugin specificity
  requires it. Do not mechanically remove existing uses without visual tests.
- Check foreground/background contrast, focus visibility, hover states, table
  readability, and the layout below 899 px.
- Run `ruby scripts/validate_theme.rb` and
  `npx --yes csstree-validator@4.0.1 stylesheets` after edits.

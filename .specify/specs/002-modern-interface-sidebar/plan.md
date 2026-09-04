# Plan — Modern interface and collapsible sidebar

## Technical approach

1. Keep the existing `style.css` as the compatibility baseline and load a new
   `modern.css` immediately after it as the shared design-system layer.
2. Define semantic custom properties and update plugin/custom styles to consume
   them without moving plugin selectors into the base layer.
3. Use Redmine 5.1.4's flex-based `#main`, `#sidebar`, and `#content` markup.
   Hiding `#sidebar` lets `#content` grow naturally without hard-coded widths.
4. Insert one theme-owned `<button>` from `theme.js` only when a desktop sidebar
   is present. Store only a boolean presentation preference in `localStorage`.
5. Preserve the native responsive flyout by scoping collapse layout rules and
   the button to viewports of at least 900 px.
6. Extend the Ruby validator with import-order and JavaScript/sidebar contract
   checks, then exercise the result in the official container and browser.
7. Override Redmine 5.1.4's negative JSToolbar tab margin on the exact direct
   child selector so toolbar controls clear the editor and preview focus border.

## Files and ownership

- `stylesheets/modern.css`: design tokens and modern core Redmine presentation.
- `javascripts/theme.js`: progressive sidebar-toggle behavior.
- `stylesheets/plugins.css`: plugin-specific palette/layout corrections.
- `stylesheets/custom.css`: narrow SCM and syntax-highlighting corrections.
- `scripts/validate_theme.rb`: deterministic runtime contract checks.
- `README.md`, `docs/`: public behavior and maintenance documentation.

## Risks and controls

- **Flash of expanded sidebar:** apply the stored state as soon as DOM is ready;
  transitions activate only after initialization.
- **Lost content on mobile:** collapse selectors and toggle are desktop-only.
- **Plugin layout collision:** override rigid plugin widths and retain plugin
  selectors in `plugins.css`.
- **Inaccessible icon-only control:** keep a real button with visible chevron,
  screen-reader text, focus ring, title, and `aria-expanded`.
- **Storage restrictions:** catch local-storage reads and writes.
- **Editor toolbar collision:** replace the core negative tab margin with
  theme spacing without changing JSToolbar markup or behavior.

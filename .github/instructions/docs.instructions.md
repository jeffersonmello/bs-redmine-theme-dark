---
applyTo: "**/*.md"
---

# Documentation instructions

- Use `Redmine 5.1.4.stable` when stating the supported target.
- Distinguish target compatibility from a completed visual smoke test.
- Do not claim support for Redmine 6 or later; its theme location and asset
  behavior differ.
- Identify optional or legacy plugin styling explicitly.
- Keep commands copy-pasteable and use the installation directory
  `public/themes/bs-redmine-theme-dark`.
- Keep README, architecture, compatibility notes, and active SpecDrive tasks in
  sync when behavior changes.
- Document sidebar changes across desktop, `nosidebar`, storage-failure, and
  native mobile-flyout states.
- Document the customer autocomplete as an instance-specific enhancement tied
  to `issue_custom_field_values_4`, not a generic Redmine feature.
- Document history and activity work against the exact Redmine 5.1.4 markup.
  Describe the lightbox as progressive enhancement that preserves permissions,
  modified-click navigation, and native links when JavaScript is unavailable.
- Document the issue timer as browser-local convenience: the rendered native
  log-time action is its permission gate, timers are independent per issue, and
  finishing opens rather than submits Redmine's native time-entry form.

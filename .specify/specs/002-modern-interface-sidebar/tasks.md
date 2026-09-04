# Tasks — Modern interface and collapsible sidebar

## Discovery

- [x] Inspect the supplied issue-detail screenshot and current visual hierarchy.
- [x] Map sidebar, content, responsive, component, plugin, and JavaScript rules.
- [x] Confirm the Redmine 5.1.4 base layout and mobile flyout contract.

## Implementation

- [x] Add the modern design-system stylesheet and preserve cascade ownership.
- [x] Implement the accessible persistent sidebar toggle.
- [x] Correct plugin/custom styles that conflict with the refreshed palette.
- [x] Separate JSToolbar buttons from issue description and preview borders.
- [x] Extend static validation for the new runtime contract.
- [x] Update README, architecture, compatibility, and contributor guidance.

## Validation

- [x] Run Ruby, CSS, JavaScript, YAML, links, and diff checks.
- [x] Validate paths and theme discovery in the official Redmine container.
- [x] Smoke-test sidebar behavior and representative surfaces at desktop width.
- [x] Verify that the desktop project title, quick search, and navigation do not
  overlap.
- [x] Smoke-test login and responsive behavior below 900 px.

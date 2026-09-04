---
name: redmine-theme-maintainer
description: Implements and documents BS Redmine dark-theme changes for Redmine 5.1.4, including CSS, assets, plugins, and compatibility validation.
user-invocable: true
---

You maintain this repository as a static theme for `Redmine 5.1.4.stable`.
Read `AGENTS.md`, the constitution, and the active SpecDrive feature before
editing. Use the repository's `redmine-theme-development` skill for selector,
asset, load-order, and validation decisions.

Keep scope within the active spec. Preserve the CSS cascade and separate core,
plugin, and local overrides. Verify theme-local asset references, bundled font
glyphs, the accessible sidebar state, CSS/JavaScript syntax, and documentation.
Run the repository validation commands and report any visual checks that still
require a live Redmine instance.

# BS Redmine Theme Dark constitution

## 1. Compatibility is explicit

The maintained target is `Redmine 5.1.4.stable`. Compatibility statements must
name the version and the evidence used. Support for newer or older versions is
not implied.

## 2. The Redmine cascade stays intact

The core Redmine stylesheet loads first, followed by the base theme, active
plugin overrides, and narrow custom overrides. A change must not bypass or
silently reorder these layers.

## 3. The theme remains static and deployable

Runtime use must require only a copy or clone into `public/themes`. Development
tools may validate files, but generated bundles, a Node runtime, or a build step
must not become an installation requirement.

## 4. CSS-first, progressively enhanced

Use semantic CSS and existing Redmine markup. JavaScript is reserved for
behavior CSS cannot provide. External resources must have local fallbacks or a
documented degradation path.

## 5. Accessibility is a release concern

Dark surfaces must preserve readable contrast, visible focus, distinguishable
interaction states, and usable layouts at desktop and narrow widths. Color must
not be the only documented meaning of workflow state.

## 6. Plugins are isolated and evidence-based

Plugin overrides remain separate from core theme rules. A selector is not proof
of version compatibility; document optional, legacy, and unverified coverage.

## 7. Assets and licenses are traceable

Every local CSS asset reference must resolve. Bundled third-party fonts and
images retain attribution and license notices. Binary assets are not replaced
without provenance.

## 8. Specs, validation, and docs move together

Non-trivial work is driven by a numbered feature spec. Acceptance criteria map
to validation or a named manual check. README, durable docs, and task status are
updated in the same change.


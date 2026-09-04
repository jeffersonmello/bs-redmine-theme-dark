# Redmine 5.1.4 theme reference

Read this reference for selector changes, asset work, compatibility reviews,
and release preparation.

## Runtime contract

- Install the repository at
  `<redmine-root>/public/themes/bs-redmine-theme-dark`.
- Redmine discovers `stylesheets/application.css` and the optional
  `javascripts/theme.js` entry point.
- The theme imports the core stylesheet with
  `../../../stylesheets/application.css` before its own overrides.
- The theme then loads `style.css`, `modern.css`, `plugins.css`, and
  `custom.css` in that order.
- Theme-owned files resolve from the theme directory. Core images referenced
  from `stylesheets/style.css` resolve through `../../../images/`.

## Upstream evidence

Use the immutable upstream tag when checking behavior:

- Source: `https://github.com/redmine/redmine/tree/5.1.4`
- Core CSS:
  `https://github.com/redmine/redmine/blob/5.1.4/public/stylesheets/application.css`
- Official theme installation guide:
  `https://www.redmine.org/projects/redmine/wiki/Themes`
- Release announcement: `https://www.redmine.org/news/146`

Do not use the upstream default branch as compatibility evidence.

## Repository-specific hazards

- Numeric `.status-N` and `.priority-N` rules reflect one Redmine database and
  may not match another installation's workflow IDs.
- Typography uses a local system font stack; no remote font service is needed.
- Font Awesome 5.15.2 is bundled locally and drives most `::before` icons.
- `plugins/redmine_wysiwyg_editor.css` targets legacy TinyMCE class names and is
  deliberately opt-in.
- The historical screenshot is a design reference, not proof of current plugin
  compatibility.
- Desktop sidebar behavior relies on Redmine's `#main`, `#sidebar`, and
  `#content` layout IDs. Below 900 px, Redmine's native flyout remains the owner
  of sidebar navigation.
- The customer autocomplete is an instance-specific enhancement for
  `issue_custom_field_values_4`; it is not a Redmine-wide field convention.

## Visual regression surfaces

At minimum inspect login, project list, issue list and filters, issue detail and
edit forms, wiki preview and code highlighting, repository diff, Gantt or
calendar, administration forms, context menus, and the mobile flyout below
899 px. When customer autocomplete changes, add a multi-value list custom field
with database ID 4 and verify issue create/edit, native option submission,
dynamic insertion, and keyboard use. Add relevant plugin pages only when those
plugins are in scope.

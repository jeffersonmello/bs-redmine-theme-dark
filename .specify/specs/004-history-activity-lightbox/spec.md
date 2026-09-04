# Feature 004 — History, activity, and image lightbox

## Intent

As a Redmine user, I want issue history and activity entries to remain visually
clear in the dark theme, and I want attached images to open in an in-page
preview, so that avatars, timelines, events, and screenshots are comfortable to
scan without leaving the current issue.

## Evidence

The supplied issue-history screenshot shows avatars colliding with the timeline
because Redmine 5.1.4 applies a `-32px` journal-avatar margin while the modern
theme had reduced the journal's left padding to `1rem`. The activity screenshot
shows the upstream light `#eeeeee` day heading, legacy horizontal rules, and
avatars that are not aligned with the event content.

Redmine 5.1.4 renders attachment thumbnails as links to an attachment preview
page and serves the original image from `/attachments/download/:id`. The theme
can progressively intercept eligible image clicks and present the original in a
modal without changing attachment permissions or server behavior.

A production screenshot later showed the viewer appended after the page footer
when its fixed-position presentation was unavailable or lost in the instance
cascade. The modal lifecycle therefore also needs a browser top-layer contract,
with fixed positioning retained as its compatibility fallback.

## Scope

- Repair issue-history avatar, timeline, header, detail, and note alignment.
- Restyle activity day headings and event pairs for the dark design system.
- Normalize history and activity avatars as bounded circular images.
- Add a dependency-free, accessible image lightbox to `theme.js`.
- Enhance issue/wiki images, attachment thumbnails, journal thumbnails, and
  attachment image previews inside `#content`.
- Resolve Redmine thumbnail/show URLs to the authorized original download URL.
- Preserve native navigation for modified clicks and non-image links.
- Support images and forms inserted dynamically.
- Use the native dialog top layer when available and show a pointer cursor on
  every eligible image trigger.

## Out of scope

- Changing Redmine's activity-event formatter or converting raw Textile/
  Markdown excerpts into server-backed attachment previews.
- Previewing PDF, video, audio, or non-image attachments.
- Bypassing Redmine attachment permissions.
- Gallery navigation, editing, annotation, or image upload.
- Redmine versions other than 5.1.4.

## Acceptance criteria

- [x] Journal avatars no longer overlap or get cut by the history timeline.
- [x] History headers, changes, notes, and thumbnails use coherent dark surfaces
  and remain readable with avatars enabled or disabled.
- [x] Activity day headings no longer inherit the upstream light background.
- [x] Activity icons, avatars, titles, descriptions, and authors align within a
  compact event layout at desktop and narrow widths.
- [x] Eligible content images open in a modal instead of following their normal
  unmodified-click navigation.
- [x] Redmine attachment thumbnail/show URLs resolve to
  `/attachments/download/:id`, while ordinary linked-image or rendered sources
  remain valid preview targets.
- [x] The modal has dialog semantics, a caption, close button, Escape and
  backdrop close behavior, scroll locking, and focus restoration.
- [x] Gravatars, avatars, toolbar images, and modified clicks are not hijacked.
- [x] Dynamically inserted eligible images are enhanced without duplicate
  handlers or modal elements.
- [x] The viewer cannot fall into normal page flow when native modal support is
  available, retains a fixed-position fallback, and eligible images show the
  hand pointer cursor.
- [x] The feature remains dependency-free and all Redmine 5.1.4 checks pass.

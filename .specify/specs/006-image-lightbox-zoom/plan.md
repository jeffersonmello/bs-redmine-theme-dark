# Plan — Image lightbox zoom

## Technical approach

1. Extend only the isolated lightbox module in `javascripts/theme.js`, retaining
   the existing eligibility and same-origin attachment resolver.
2. Add localized, semantic zoom controls and a focusable scroll viewport to
   the lazily created modal, preserving the close lifecycle and native dialog
   fallback.
3. Derive fitted dimensions from the image's natural size and available
   viewport, capped at the original size, then apply a bounded 1–4 zoom factor
   in 0.25 steps.
4. Keep enlargement within the scroll viewport so panning does not displace
   the caption or controls; support plain wheel zoom, mouse dragging, native
   touch scrolling, and keyboard access.
5. Centralize fit/reset and readiness handling for opening, successful load,
   source fallback, failure, closing, and resize; clear active drags as needed.
6. Extend focused lightbox tests, keep presentation in `modern.css`, and update
   README, architecture, compatibility, and this feature's tasks.
7. Run the required checks and the exact `redmine:5.1.4` asset validator, then
   exercise desktop and narrow browser views and record the evidence accurately.

## Files and ownership

- `javascripts/theme.js`: fitted dimensions, zoom/pan state, controls, keyboard
  behavior, and modal lifecycle.
- `stylesheets/modern.css`: toolbar, image viewport, drag affordance, and
  responsive layout.
- `tests/theme_lightbox_test.js`: zoom limits, reset/readiness, interaction,
  focus, and existing lightbox regressions.
- `README.md`, `docs/`, this feature directory: behavior, acceptance, and
  validation evidence.

## Risks and controls

- **Unreachable image edges:** use scrollable dimensions and verify wide and
  tall images, fit resets, and keyboard panning.
- **Browser gesture interception:** handle wheel input only inside the image
  viewport and leave modified input native.
- **Stale zoom or dragging:** clear per-image state at each load/reset/close
  boundary and on resize.
- **Lost keyboard access:** include enabled controls and the viewport in the
  focus cycle and preserve Escape and trigger-focus restoration.
- **Misleading percentage:** document that zoom is relative to the fitted size,
  not original image pixels.
- **Unproven compatibility:** distinguish automated checks, local browser
  fixtures, and a live Redmine attachment smoke test in recorded evidence.

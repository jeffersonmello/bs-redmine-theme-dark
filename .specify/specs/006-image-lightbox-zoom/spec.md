# Feature 006 — Image lightbox zoom

## Intent

As a Redmine user, I want to enlarge images inside the existing preview and
move around the enlarged image, so that screenshot details remain readable
without leaving the current issue or losing the modal controls.

## Evidence

The existing lightbox opens eligible content images and resolves Redmine 5.1.4
attachment thumbnails to authorized originals. Its fitted presentation provides
no zoom or panning controls. The requested enhancement builds on Feature 004's
image eligibility, source resolution, native dialog, and focus contracts.

## Scope

- Add localized zoom-in, zoom-out, and Fit controls with a percentage display.
- Start at a fitted size that does not enlarge smaller original images.
- Zoom from 100% to 400% of the fitted size in 25-point steps.
- Zoom with plain wheel input inside the viewport and unmodified `+`/`-` keys.
- Reset fit with the Fit control or unmodified `0` key.
- Pan enlarged content with mouse dragging, native touch scrolling, or keyboard
  arrows while the image viewport is focused.
- Keep controls visible and keyboard reachable at desktop and narrow widths.
- Reset zoom and pan across loading, fallback, errors, close/reopen, and resize.
- Preserve image eligibility, attachment authorization, modified clicks,
  browser gestures, native modal fallback, and focus restoration.

## Out of scope

- Image editing, annotation, upload, gallery navigation, or non-image previews.
- Custom pinch-to-zoom gestures or disabling browser zoom.
- Attachment authorization changes, external image services, or dependencies.
- Redmine versions other than `5.1.4.stable`.

## Acceptance criteria

- [x] Opening a loaded image starts at 100% of its fitted size, without
  enlarging a small original or carrying over another image's zoom/pan.
- [x] Zoom controls and shortcuts use 25-point steps, clamp at 100% and 400%,
  and keep the percentage display and enabled state synchronized.
- [x] Fit and `0` restore the fitted image and reset scrolling.
- [x] Plain viewport wheel input zooms while modified wheel gestures and
  shortcuts retain browser behavior.
- [x] Enlarged content can be panned with a mouse and keyboard arrows without
  moving the toolbar out of view; touch input is left to native scrolling.
- [x] Enabled controls and the viewport remain keyboard reachable; Escape,
  backdrop, and close button still restore body scrolling and trigger focus.
- [x] Loading, source fallback, errors, close/reopen, and resize reset zoom and
  pan, clear dragging, and prevent zoom on an unavailable image.
- [x] Same-origin Redmine attachment resolution, exclusions, dynamic insertion,
  and modified-click behavior pass regression checks.
- [x] Required automated checks pass and desktop/narrow browser evidence is
  recorded with any untested release-matrix surfaces identified.

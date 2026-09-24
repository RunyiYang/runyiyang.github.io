// Preserve the statistics link when the external map is unavailable or blocked.
(() => {
  const image = document.getElementById('visitor-map-image');
  if (!image) return;
  const link = image.closest('a');
  const fallback = document.getElementById('visitor-map-fallback');
  const showState = available => {
    link.hidden = !available;
    fallback.hidden = available;
  };
  image.addEventListener('load', () => showState(true));
  image.addEventListener('error', () => showState(false));
  if (image.complete) showState(image.naturalWidth > 0);
})();

export function isGalleryPreviewMode() {
  return typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('preview') === 'true';
}

export function previewNow(offsetDays = 0, hour = 19, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

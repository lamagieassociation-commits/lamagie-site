// L'AMagie — petites sécurités d'affichage.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach(img => {
    img.loading = img.loading || 'lazy';
    img.addEventListener('error', () => {
      img.style.outline = '1px solid rgba(217,191,114,.35)';
      img.style.minHeight = img.style.minHeight || '120px';
    }, { once:true });
  });
});

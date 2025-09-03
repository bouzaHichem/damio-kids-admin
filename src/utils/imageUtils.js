export const getImageUrl = (img) => {
  if (!img) return '/api/placeholder/80/80';
  // Absolute URL (Cloudinary or other CDN)
  if (/^https?:\/\//i.test(img)) return img;
  // Build absolute URL to backend for relative image paths
  const base = process.env.REACT_APP_BACKEND_URL || 'https://damio-kids-backend.onrender.com';
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${base}${path}`;
};


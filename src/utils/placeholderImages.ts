// Placeholder images utility
// Bu dosya güvenli placeholder image'lar sağlar ve sonsuz loop'ları önler

// Base64 encoded mini placeholder book image (1x1 transparent pixel)
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Simple book placeholder SVG
const BOOK_PLACEHOLDER_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="180" fill="#f0f0f0" stroke="#ddd" stroke-width="2" rx="4"/>
  <rect x="20" y="30" width="80" height="8" fill="#ddd" rx="2"/>
  <rect x="20" y="50" width="60" height="6" fill="#e5e5e5" rx="2"/>
  <rect x="20" y="65" width="70" height="6" fill="#e5e5e5" rx="2"/>
  <rect x="30" y="100" width="60" height="40" fill="#e9ecef" stroke="#ddd" stroke-width="1" rx="2"/>
  <text x="60" y="125" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">BOOK</text>
</svg>
`)}`;

// Simple meetup placeholder SVG
const MEETUP_PLACEHOLDER_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2" rx="8"/>
  <circle cx="120" cy="80" r="20" fill="#dee2e6"/>
  <circle cx="150" cy="80" r="20" fill="#adb5bd"/>
  <circle cx="180" cy="80" r="20" fill="#dee2e6"/>
  <path d="M 130 100 Q 150 90 170 100" stroke="#adb5bd" stroke-width="3" fill="none"/>
  <text x="150" y="140" text-anchor="middle" font-family="Arial" font-size="16" fill="#6c757d">Meetup Image</text>
</svg>
`)}`;

// Avatar placeholder SVG
const AVATAR_PLACEHOLDER_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#e9ecef"/>
  <circle cx="50" cy="35" r="15" fill="#adb5bd"/>
  <path d="M 25 75 Q 50 60 75 75" fill="#adb5bd"/>
</svg>
`)}`;

// Track failed images to prevent infinite loops
const failedImages = new Set<string>();

export const PlaceholderImages = {
  // Book placeholder
  book: BOOK_PLACEHOLDER_SVG,
  
  // Meetup placeholder  
  meetup: MEETUP_PLACEHOLDER_SVG,
  
  // Avatar placeholder
  avatar: AVATAR_PLACEHOLDER_SVG,
  
  // Transparent pixel (for broken images)
  transparent: TRANSPARENT_PIXEL,
  
  // Safe image handler to prevent loops
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement>, fallbackType: 'book' | 'meetup' | 'avatar' = 'book') => {
    const img = event.target as HTMLImageElement;
    const originalSrc = img.src;
    
    // If this image has already failed, use transparent pixel to stop loop
    if (failedImages.has(originalSrc)) {
      img.src = TRANSPARENT_PIXEL;
      return;
    }
    
    // Mark this image as failed
    failedImages.add(originalSrc);
    
    // Set appropriate placeholder
    switch (fallbackType) {
      case 'book':
        img.src = BOOK_PLACEHOLDER_SVG;
        break;
      case 'meetup':
        img.src = MEETUP_PLACEHOLDER_SVG;
        break;
      case 'avatar':
        img.src = AVATAR_PLACEHOLDER_SVG;
        break;
    }
  },
  
  // Clear failed images cache
  clearFailedCache: () => {
    failedImages.clear();
  }
};

export default PlaceholderImages;
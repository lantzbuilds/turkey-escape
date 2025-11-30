// Check URL param ?mobile=true to force mobile mode for testing
function isForcedMobile(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('mobile') === 'true';
}

export function isMobile(): boolean {
  // Allow forcing mobile mode via URL param for testing
  if (isForcedMobile()) return true;

  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check user agent for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);

  // Check screen size (mobile typically < 768px width)
  const isSmallScreen = window.innerWidth <= 768;

  // Consider it mobile if it has touch AND (mobile UA OR small screen)
  return hasTouch && (isMobileUA || isSmallScreen);
}

export function hasTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

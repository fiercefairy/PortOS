/** Platform detection — provides isMac flag and modifier key label for keyboard shortcuts */
export const isMac = typeof navigator !== 'undefined' &&
  (/mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? ''));

export const modKey = isMac ? '⌘' : 'Ctrl';

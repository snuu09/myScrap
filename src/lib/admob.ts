declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const publisherId = import.meta.env.VITE_ADMOB_PUBLISHER_ID?.trim() ?? "";
const bannerSlot = import.meta.env.VITE_ADMOB_BANNER_SLOT?.trim() ?? "";

let scriptPromise: Promise<void> | null = null;

/** AdMob web banners use the AdSense / adsbygoogle tag in browser SPAs. */
export function admobConfigured() {
  return Boolean(publisherId && bannerSlot);
}

export function admobPublisherId() {
  return publisherId;
}

export function admobBannerSlot() {
  return bannerSlot;
}

export function loadAdMobScript() {
  if (!publisherId) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-admob-client="${publisherId}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = "anonymous";
    script.dataset.admobClient = publisherId;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("admob script"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function pushAdMobBanner() {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch {
    /* ad blockers */
  }
}

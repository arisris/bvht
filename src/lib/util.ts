import type { Manifest } from "vite";

let cachedManifest: Manifest | undefined = undefined;
/**
 * Returns the manifest file for production build.
 *
 * It lazy-loads the manifest from `/dist/.vite/manifest.json` if it hasn't been loaded yet.
 * This is only applicable in production environments (`import.meta.env.PROD`).
 *
 * @returns {Manifest | undefined} The manifest file or undefined if not in production mode.
 */
export const getManifest = (): Manifest | undefined => {
  if (!import.meta.env.PROD) return undefined;
  if (!cachedManifest) {
    const mf = import.meta.glob<{ default: Manifest }>(
      "/dist/.vite/manifest.json",
      { eager: true }
    );
    for (let [, mod] of Object.entries(mf)) {
      if (mod["default"]) {
        cachedManifest = mod.default;
        break;
      }
    }
  }
  return cachedManifest;
};

/**
 * Returns the script file path based on the name and the manifest file.
 *
 * In production, it resolves the hashed filename from the manifest.
 * In development, it returns the name as is.
 *
 * @param {string} name - The name of the script.
 * @returns {string} The script file path.
 */
export const getAsset = (name: string): string => {
  return `/${getManifest()?.[name]?.file ?? name}`;
};

/**
 * Generate a script for toggling dark mode.
 *
 * This script handles:
 * - Checking local storage for a user preference.
 * - Checking the system preference (`prefers-color-scheme`) if no local storage is found.
 * - Applying the appropriate class (e.g., `dark`) to the document element.
 * - Setting up event listeners for a toggle button.
 * - Handling Astro view transitions if enabled.
 *
 * @param {Object} options - Configuration options for the script.
 * @param {string} [options.storageKey=_t_] - The local storage key for storing the theme preference.
 * @param {string} [options.toggleId=toggle-theme] - The DOM ID of the toggle element.
 * @param {string} [options.darkKey=dark] - The class name for the dark theme.
 * @param {string} [options.lightKey=light] - The class name for the light theme.
 * @param {boolean} [options.isAstroViewTransition=false] - Whether to hook into Astro's view transition events.
 * @returns {string} The minified JavaScript code as a string.
 */
export const getDarkModeScript = ({
  storageKey = "_t_",
  toggleId = "toggle-theme",
  darkKey = "dark",
  lightKey = "light",
  isAstroViewTransition = false,
}: {
  storageKey?: string;
  toggleId?: string;
  darkKey?: string;
  lightKey?: string;
  isAstroViewTransition?: boolean;
} = {}): string =>
  `!((e,t,m,a,v)=>{const c=()=>"undefined"!=typeof localStorage&&localStorage.getItem(e)?localStorage.getItem(e):window.matchMedia(\`(prefers-color-scheme:\${m})\`).matches?m:a,n=(t=c())=>{t===a?document.documentElement.classList.remove(m):document.documentElement.classList.add(m),window.localStorage.setItem(e,t)},o=()=>{const e=document.getElementById(t);e&&e.addEventListener("click",e=>{e.preventDefault(),n(c()===m?a:m)})};n();v?(document.addEventListener("astro:after-swap",()=>n()),document.addEventListener("astro:page-load",o)):(window.addEventListener("DOMContentLoaded",o))})("${storageKey}","${toggleId}","${darkKey}","${lightKey}",${isAstroViewTransition});`;

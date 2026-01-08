import type { Manifest } from "vite";

let cachedManifest: Manifest | undefined = undefined;
/**
 * Returns the manifest file for production build.
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
 * @param {string} name - The name of the script.
 * @returns {string} The script file path. If the manifest file is not found or the script file is not found in the manifest, it returns the name as is.
 */
export const getAsset = (name: string): string => {
  return `/${getManifest()?.[name]?.file ?? name}`;
};

/**
 * Generate a script for toggling dark mode.
 *
 * @param {{ storageKey?: string, toggleId?: string, darkKey?: string, lightKey?: string, isAstroViewTransition?: boolean }} options - Options for the script.
 * @param {string} [options.storageKey=_t_] - The storage key for storing the mode.
 * @param {string} [options.toggleId=toggle-theme] - The id of the toggle element.
 * @param {string} [options.darkKey=dark] - The key for the dark theme.
 * @param {string} [options.lightKey=light] - The key for the light theme.
 * @param {boolean} [options.isAstroViewTransition=false] - Whether to use the astro page transition events.
 * @returns {string} The script as a string.
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

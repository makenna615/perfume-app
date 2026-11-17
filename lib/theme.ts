/** Storage key shared with the inline script in app/layout.tsx. */
export const THEME_KEY = "theme";

/**
 * Inline <head> script: applies the saved theme (or the system setting) before first paint,
 * and keeps following the system setting until the visitor picks one explicitly.
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)"),s=null;try{s=localStorage.getItem("${THEME_KEY}")}catch(e){}function a(t){d.setAttribute("data-theme",t)}a(s==="dark"||s==="light"?s:m.matches?"dark":"light");m.addEventListener("change",function(e){var c=null;try{c=localStorage.getItem("${THEME_KEY}")}catch(x){}if(c!=="dark"&&c!=="light")a(e.matches?"dark":"light")})}catch(e){}})()`;

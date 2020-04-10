export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// remove newlines and trim
export function clean(src: string | undefined) {
  if (src) {
    return src.replace(/\n|・/g, "").replace(/\s+/g,' ').trim();
  }
  return '';
}
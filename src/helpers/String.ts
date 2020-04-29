export const capitalize = (s: string) => {
  if (s) {
    if (s.length > 1) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s.charAt(0).toUpperCase();
  }
  return '';
};

// remove newlines and trim
export function clean(src: string | undefined) {
  if (src) {
    return src.replace(/\n|・/g, '').replace(/\s+/g, ' ').trim();
  }
  return '';
}

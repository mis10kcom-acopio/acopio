export function isInInstagramBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  return /Instagram|FBAN/i.test(userAgent);
}

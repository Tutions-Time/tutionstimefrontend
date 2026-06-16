export const CLASS_JOIN_NOTICE =
  "Tab/Laptop and high speed internet is required.";

export const openClassLinkWithNotice = (url?: string | null) => {
  if (!url) return false;
  if (!window.confirm(CLASS_JOIN_NOTICE)) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
};

export function isUnsupportedGoogleOAuthOrigin(urlLike: string) {
  try {
    const url = new URL(urlLike);
    const isRawIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname);
    const isLocalhostIp = url.hostname === "127.0.0.1";

    return url.protocol === "http:" && isRawIpv4 && !isLocalhostIp;
  } catch {
    return false;
  }
}

export function getGoogleOAuthDevHint(urlLike: string) {
  if (!isUnsupportedGoogleOAuthOrigin(urlLike)) {
    return null;
  }

  return "Google Login ใช้กับ raw private IP ไม่ได้ ให้ใช้ localhost บนเครื่องนี้ หรือ public HTTPS tunnel สำหรับทดสอบบนมือถือ";
}
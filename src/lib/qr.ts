import QRCode from "qrcode";

/** PNG data-URL QR for a live portfolio URL. High EC so it scans off a printed CV. */
export async function portfolioQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 320,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

// Builds the OpenRouter user message for CV parsing: combined extracted text
// and/or inline base64 image(s) for the vision path. Pure + testable — the
// parse-cv route extracts files, this assembles what the model sees.

export type Img = { buf: Buffer; mime: string };

export function buildUserContent(
  text: string | null,
  images: Img[] | undefined,
  maxChars: number
): unknown {
  const clipped = (text || "").slice(0, maxChars);
  if (images && images.length > 0) {
    const parts: unknown[] = [
      {
        type: "text",
        text: clipped
          ? `Extract one CV from the attached file(s) and this text combined:\n${clipped}`
          : "Extract this CV from the attached file(s) into the schema.",
      },
    ];
    for (const img of images) {
      parts.push({
        type: "image_url",
        image_url: { url: `data:${img.mime};base64,${img.buf.toString("base64")}` },
      });
    }
    return parts;
  }
  return clipped;
}

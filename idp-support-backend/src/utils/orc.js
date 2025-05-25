import { createWorker } from "tesseract.js";
import sharp from "sharp";

export async function extractTextFromImage(filePath) {
  const processedBuffer = await sharp(filePath)
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();

  const worker = await createWorker("ukr+eng", undefined, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0/",
  });

  const {
    data: { text },
  } = await worker.recognize(processedBuffer);

  await worker.terminate();

  return text;
}

export function parseOcrData(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim().toUpperCase())
    .filter((l) => l.length > 1);

  function getDocumentNumber(lines) {
    for (const line of lines) {
      const match = line.match(/\b\d{9}\b/);
      if (match) return match[0];
    }
    return "";
  }

  const documentNumber = getDocumentNumber(lines);

  return {
    documentNumber,
    rawText: lines.join("\n"),
  };
}

function tryGetNextValue(lines, fromIndex, exclude = []) {
  for (let i = fromIndex + 1; i <= fromIndex + 3 && i < lines.length; i++) {
    const candidate = lines[i].trim();
    const clean = candidate
      .replace(/[^А-ЯІЇЄҐ'’\- ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (
      clean.length >= 2 &&
      /^[А-ЯІЇЄҐ'’\- ]+$/.test(clean) &&
      !exclude.includes(clean) &&
      !/(ПРІЗВИЩЕ|SURNAME|ІМ.?Я|NAME|ПО БАТЬКОВІ|PATRONYMIC|FETRONYMIC)/.test(
        clean
      )
    ) {
      return clean;
    }
  }
  return "";
}

const DRIVE_HOST = /(?:^|\.)drive\.google\.com$/i;
const DRIVE_FILE_ID_IN_PATH = /\/file\/d\/([a-zA-Z0-9_-]+)/;

export function toGoogleDrivePreviewUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  if (!DRIVE_HOST.test(parsed.hostname)) {
    return trimmed;
  }

  const fileId = parsed.pathname.match(DRIVE_FILE_ID_IN_PATH)?.[1] ?? parsed.searchParams.get('id');
  if (!fileId) return trimmed;

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

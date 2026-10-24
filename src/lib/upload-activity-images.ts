import { getAuthToken } from '@/features/auth/lib/auth-token-store';
import { uploadFiles } from '@/lib/uploadthing';

export type ActivityImageSlug =
  | 'plantationImage'
  | 'irrigationImage'
  | 'rougingImage'
  | 'stripTestImage'
  | 'dehaulmingImage'
  | 'fieldVisitImage';

type UploadedActivityFile = {
  ufsUrl?: string | null;
  url?: string | null;
};

export class ActivityImageUploadError extends Error {
  readonly reason: 'signed-out' | 'incomplete';

  constructor(reason: 'signed-out' | 'incomplete') {
    super(reason);
    this.name = 'ActivityImageUploadError';
    this.reason = reason;
  }
}

function uploadedFileUrl(file: UploadedActivityFile) {
  const preferred = file.ufsUrl?.trim() ?? '';
  if (preferred.length > 0) return preferred;
  return file.url?.trim() ?? '';
}

export async function uploadActivityImages(slug: ActivityImageSlug, files: File[]) {
  if (files.length === 0) return [];

  const token = getAuthToken();
  if (!token) throw new ActivityImageUploadError('signed-out');

  const uploaded = await uploadFiles(slug, {
    files,
    headers: { Authorization: `Bearer ${token}` },
  });
  const urls = uploaded.map((file) => uploadedFileUrl(file));
  if (urls.length !== files.length || urls.some((url) => url.length === 0)) {
    throw new ActivityImageUploadError('incomplete');
  }

  return urls;
}

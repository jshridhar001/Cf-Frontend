import { toGoogleDrivePreviewUrl } from '@/features/farmer-profile/lib/google-drive-preview-url';

export function ContractPdfViewer({ url }: { url: string }) {
  const previewUrl = toGoogleDrivePreviewUrl(url);

  return (
    <iframe
      title="Contract PDF"
      src={previewUrl}
      allowFullScreen
      className="h-[70vh] min-h-[24rem] w-full rounded-md border sm:min-h-[36rem]"
    />
  );
}

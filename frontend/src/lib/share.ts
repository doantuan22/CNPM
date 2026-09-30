export type ShareResult = 'shared' | 'copied' | 'cancelled';

/**
 * Shares a link with the Web Share API when the browser has it (mostly phones),
 * otherwise copies it to the clipboard. Both APIs need a secure context (HTTPS or
 * localhost); when neither can be used this throws so the caller can tell the user.
 * A dismissed share sheet is not an error: it resolves to 'cancelled'.
 */
export async function shareUrl({ title, url }: { title: string; url: string }): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Any other failure: fall through and try the clipboard instead.
    }
  }
  if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Trình duyệt không hỗ trợ chia sẻ hoặc sao chép liên kết');
  await navigator.clipboard.writeText(url);
  return 'copied';
}

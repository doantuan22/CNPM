import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareUrl } from './share';

const input = { title: 'Khách sạn thử', url: 'https://egode.test/hotels/1' };

const setNavigator = (patch: { share?: unknown; clipboard?: unknown }) => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: patch.share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: patch.clipboard });
};

afterEach(() => setNavigator({}));

describe('shareUrl', () => {
  it('uses the native share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });

    await expect(shareUrl(input)).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith(input);
  });

  it('reports a cancelled share sheet instead of failing or copying', async () => {
    const writeText = vi.fn();
    setNavigator({ share: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')), clipboard: { writeText } });

    await expect(shareUrl(input)).resolves.toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });

    await expect(shareUrl(input)).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(input.url);
  });

  it('falls back to copying when the share sheet fails for another reason', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share: vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError')), clipboard: { writeText } });

    await expect(shareUrl(input)).resolves.toBe('copied');
  });

  it('throws when neither sharing nor copying is possible (e.g. an insecure origin)', async () => {
    setNavigator({});
    await expect(shareUrl(input)).rejects.toThrow();
  });
});

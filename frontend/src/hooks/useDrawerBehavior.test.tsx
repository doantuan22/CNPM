import { useRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useDrawerBehavior } from './useDrawerBehavior';

function Harness({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDrawerBehavior({ open, onClose: () => setOpen(false), containerRef: ref, enabled });
  return (
    <>
      <button onClick={() => setOpen(true)}>opener</button>
      <div ref={ref} data-open={open}>
        <a href="#first">first</a>
        <button>middle</button>
        <button>last</button>
      </div>
      <output data-testid="state">{open ? 'open' : 'closed'}</output>
    </>
  );
}

describe('useDrawerBehavior', () => {
  it('moves focus into the drawer when it opens and locks page scroll until it closes', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'opener' }));

    await waitFor(() => expect(screen.getByRole('link', { name: 'first' })).toHaveFocus());
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps Tab and Shift+Tab inside the drawer', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'opener' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'first' })).toHaveFocus());

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('link', { name: 'first' })).toHaveFocus();
  });

  it('closes on Escape and gives focus back to the element that opened it', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'opener' });
    await user.click(opener);
    await waitFor(() => expect(screen.getByRole('link', { name: 'first' })).toHaveFocus());

    await user.keyboard('{Escape}');

    expect(screen.getByTestId('state')).toHaveTextContent('closed');
    expect(opener).toHaveFocus();
  });

  it('does nothing while disabled (e.g. a sidebar that is permanently visible on desktop)', async () => {
    const user = userEvent.setup();
    render(<Harness enabled={false} />);

    await user.click(screen.getByRole('button', { name: 'opener' }));
    await user.keyboard('{Escape}');

    expect(document.body.style.overflow).toBe('');
    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });
});

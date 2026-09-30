import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardTopbar } from './DashboardNavigation';
import { ROLE_NAMES } from '../../lib/roles';
import { renderWithProviders } from '../../test/testUtils';

describe('DashboardTopbar', () => {
  it('has no search box or notification bell, which do nothing yet', () => {
    renderWithProviders(<DashboardTopbar role={ROLE_NAMES.ADMIN} />);

    expect(screen.queryByRole('textbox', { name: 'Tìm kiếm' })).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thông báo' })).not.toBeInTheDocument();
  });

  it.each([
    [ROLE_NAMES.PARTNER, '/owner/profile'],
    [ROLE_NAMES.ADMIN, '/profile'],
  ])('still offers the menu toggle and the profile link for %s', (role, profile) => {
    renderWithProviders(<DashboardTopbar role={role} />);

    expect(screen.getByRole('button', { name: 'Mở menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quản trị viên|Đối tác/ })).toHaveAttribute('href', profile);
  });
});

import { describe, expect, it } from 'vitest';
import { ROLE_NAMES, profilePathFor } from './roles';

describe('profilePathFor', () => {
  it.each([
    [ROLE_NAMES.CUSTOMER, '/profile'],
    [ROLE_NAMES.PARTNER, '/owner/profile'],
    [ROLE_NAMES.ADMIN, '/admin/profile'],
  ])('%s has the profile page inside their own area (%s)', (role, path) => {
    expect(profilePathFor(role)).toBe(path);
  });

  it('falls back to the customer profile for an unknown or missing role', () => {
    expect(profilePathFor(null)).toBe('/profile');
    expect(profilePathFor('Vai trò lạ')).toBe('/profile');
  });
});

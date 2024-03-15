import { customUserLoginPlugin } from './plugin';

describe('custom-user-login', () => {
  it('should export plugin', () => {
    expect(customUserLoginPlugin).toBeDefined();
  });
});

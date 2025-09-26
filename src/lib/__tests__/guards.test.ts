import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, getOptionalAuth } from '@/lib/auth/guards';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}));

import { auth } from '@/lib/auth';

describe('guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = { user: { id: '123' } };
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth(mockRequest);

      expect(result).toBe(mockSession);
      expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockRequest.headers });
    });

    it('should throw 401 error when user is not authenticated', async () => {
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await requireAuth(mockRequest);
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(401);
      }
    });

    it('should throw 403 error when user lacks required role', async () => {
      const mockSession = { user: { id: '123', roles: ['user'] } };
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      try {
        await requireAuth(mockRequest, 'admin');
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(403);
      }
    });

    it('should return session when user has required role', async () => {
      const mockSession = { user: { id: '123', roles: ['admin'] } };
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth(mockRequest, 'admin');

      expect(result).toBe(mockSession);
    });
  });

  describe('getOptionalAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = { user: { id: '123' } };
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await getOptionalAuth(mockRequest);

      expect(result).toBe(mockSession);
    });

    it('should return null when user is not authenticated', async () => {
      const mockRequest = { headers: new Headers() };

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getOptionalAuth(mockRequest);

      expect(result).toBeNull();
    });
  });
});

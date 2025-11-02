import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Test suite for Vercel API client
 * Tests HTTP request handling, error handling, and API integration
 */

interface VercelApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface VercelErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

class VercelClient {
  private token: string;
  private baseUrl = 'https://api.vercel.com';
  private rateLimitRemaining = 100;
  private rateLimitReset = Date.now() + 3600000;

  constructor(token: string) {
    if (!token) {
      throw new Error('Vercel token is required');
    }
    this.token = token;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Update rate limit info from headers
    const remaining = response.headers.get('x-rate-limit-remaining');
    const reset = response.headers.get('x-rate-limit-reset');
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset);

    if (!response.ok) {
      const errorData = (await response.json()) as VercelErrorResponse;
      throw new Error(
        `Vercel API error: ${errorData.error.message} (${response.status})`
      );
    }

    return response.json();
  }

  getRateLimitInfo() {
    return {
      remaining: this.rateLimitRemaining,
      reset: new Date(this.rateLimitReset),
    };
  }

  isRateLimited(): boolean {
    return this.rateLimitRemaining <= 0 || Date.now() >= this.rateLimitReset;
  }
}

describe('Vercel Client', () => {
  let client: VercelClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    client = new VercelClient('test-token-abc123');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create client with valid token', () => {
      // Act
      const newClient = new VercelClient('vercel_test_token');

      // Assert
      expect(newClient).toBeDefined();
    });

    it('should throw error if token is empty', () => {
      // Act & Assert
      expect(() => {
        new VercelClient('');
      }).toThrow('Vercel token is required');
    });

    it('should throw error if token is null', () => {
      // Act & Assert
      expect(() => {
        new VercelClient(null as unknown as string);
      }).toThrow('Vercel token is required');
    });

    it('should throw error if token is undefined', () => {
      // Act & Assert
      expect(() => {
        new VercelClient(undefined as unknown as string);
      }).toThrow('Vercel token is required');
    });
  });

  describe('request()', () => {
    it('should make successful GET request', async () => {
      // Arrange
      const mockResponse = {
        id: '123',
        name: 'test-project',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '99'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => mockResponse,
      });

      // Act
      const result = await client.request('GET', '/v13/projects');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v13/projects',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-abc123',
          }),
        })
      );
    });

    it('should make successful POST request with body', async () => {
      // Arrange
      const mockResponse = { id: 'db-123', status: 'created' };
      const requestBody = { name: 'my-database', region: 'us-east-1' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '98'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => mockResponse,
      });

      // Act
      const result = await client.request('POST', '/v4/databases', requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v4/databases',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include authorization header with token', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '99'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');

      // Assert
      const call = vi.mocked(global.fetch).mock.calls[0];
      expect(call[1].headers.Authorization).toBe('Bearer test-token-abc123');
    });

    it('should throw error on API error response', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Vercel API error: Invalid token (401)'
      );
    });

    it('should throw error on 404 not found', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects/xyz')).rejects.toThrow(
        'Project not found'
      );
    });

    it('should throw error on 500 server error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error('Request timeout')
      );

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle malformed JSON response', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '99'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should make DELETE request', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '98'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => ({ success: true }),
      });

      // Act
      const result = await client.request('DELETE', '/v4/databases/db-123');

      // Assert
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v4/databases/db-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should make PATCH request', async () => {
      // Arrange
      const requestBody = { name: 'new-name' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '97'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => ({ success: true }),
      });

      // Act
      const result = await client.request('PATCH', '/v4/databases/db-123', requestBody);

      // Assert
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v4/databases/db-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('rate limiting', () => {
    it('should track rate limit remaining from response header', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '42'],
          ['x-rate-limit-reset', String(Date.now() + 3600000)],
        ]),
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');
      const rateLimitInfo = client.getRateLimitInfo();

      // Assert
      expect(rateLimitInfo.remaining).toBe(42);
    });

    it('should track rate limit reset time from response header', async () => {
      // Arrange
      const resetTime = Date.now() + 1800000; // 30 minutes from now
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '99'],
          ['x-rate-limit-reset', String(resetTime)],
        ]),
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');
      const rateLimitInfo = client.getRateLimitInfo();

      // Assert
      expect(rateLimitInfo.reset.getTime()).toBe(resetTime);
    });

    it('should detect rate limit exceeded', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '0'],
          ['x-rate-limit-reset', String(Date.now() + 1800000)],
        ]),
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');

      // Assert
      expect(client.isRateLimited()).toBe(true);
    });

    it('should detect when rate limit reset time has passed', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-rate-limit-remaining', '50'],
          ['x-rate-limit-reset', String(Date.now() - 1000)], // Time in past
        ]),
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');

      // Assert
      expect(client.isRateLimited()).toBe(true);
    });

    it('should handle missing rate limit headers gracefully', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map(), // No rate limit headers
        json: async () => ({}),
      });

      // Act
      await client.request('GET', '/v13/projects');

      // Assert
      // Should not throw, should keep previous values
      expect(client.getRateLimitInfo()).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle 403 forbidden error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'You do not have permission'
      );
    });

    it('should handle 429 rate limit error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([
          ['x-rate-limit-remaining', '0'],
          ['x-rate-limit-reset', String(Date.now() + 60000)],
        ]),
        json: async () => ({
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle 400 bad request error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid request parameters',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Invalid request parameters'
      );
    });

    it('should handle 502 bad gateway error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 502,
        headers: new Map(),
        json: async () => ({
          error: {
            code: 'BAD_GATEWAY',
            message: 'Bad gateway',
          },
        }),
      });

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'Bad gateway'
      );
    });

    it('should handle DNS resolution failure', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error('ENOTFOUND api.vercel.com')
      );

      // Act & Assert
      await expect(client.request('GET', '/v13/projects')).rejects.toThrow(
        'ENOTFOUND'
      );
    });
  });

  describe('multiple sequential requests', () => {
    it('should handle multiple sequential requests', async () => {
      // Arrange
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([
            ['x-rate-limit-remaining', '99'],
            ['x-rate-limit-reset', String(Date.now() + 3600000)],
          ]),
          json: async () => ({ id: '1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([
            ['x-rate-limit-remaining', '98'],
            ['x-rate-limit-reset', String(Date.now() + 3600000)],
          ]),
          json: async () => ({ id: '2' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([
            ['x-rate-limit-remaining', '97'],
            ['x-rate-limit-reset', String(Date.now() + 3600000)],
          ]),
          json: async () => ({ id: '3' }),
        });

      // Act
      const result1 = await client.request('GET', '/v13/projects/1');
      const result2 = await client.request('GET', '/v13/projects/2');
      const result3 = await client.request('GET', '/v13/projects/3');

      // Assert
      expect(result1).toEqual({ id: '1' });
      expect(result2).toEqual({ id: '2' });
      expect(result3).toEqual({ id: '3' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should properly update rate limit across multiple requests', async () => {
      // Arrange
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([
            ['x-rate-limit-remaining', '50'],
            ['x-rate-limit-reset', String(Date.now() + 3600000)],
          ]),
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([
            ['x-rate-limit-remaining', '25'],
            ['x-rate-limit-reset', String(Date.now() + 3600000)],
          ]),
          json: async () => ({}),
        });

      // Act
      await client.request('GET', '/v13/projects');
      let rateLimitInfo = client.getRateLimitInfo();
      expect(rateLimitInfo.remaining).toBe(50);

      await client.request('GET', '/v13/projects');
      rateLimitInfo = client.getRateLimitInfo();

      // Assert
      expect(rateLimitInfo.remaining).toBe(25);
    });
  });
});

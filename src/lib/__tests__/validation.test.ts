import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationService, ValidationError } from '@/lib/validation/validator';
import { schemas } from '@/lib/validation/schemas';

describe('ValidationService', () => {
  describe('validate', () => {
    it('should validate correct user data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        bio: 'Software developer',
        location: 'New York',
        website: 'https://johndoe.com',
        timezone: 'UTC',
        language: 'en' as const,
        theme: 'DARK' as const
      };

      const result = ValidationService.validate(schemas.user, userData);
      expect(result).toEqual(userData);
    });

    it('should throw ValidationError for invalid email', () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        timezone: 'UTC',
        language: 'en' as const,
        theme: 'DARK' as const
      };

      expect(() => {
        ValidationService.validate(schemas.user, userData);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required fields', () => {
      const userData = {
        email: 'john@example.com'
      };

      expect(() => {
        ValidationService.validate(schemas.user, userData);
      }).toThrow(ValidationError);
    });
  });

  describe('safeValidate', () => {
    it('should return success for valid data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        timezone: 'UTC',
        language: 'en' as const,
        theme: 'DARK' as const
      };

      const result = ValidationService.safeValidate(schemas.user, userData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(userData);
    });

    it('should return errors for invalid data', () => {
      const userData = {
        name: '',
        email: 'invalid-email',
        timezone: 'UTC',
        language: 'en' as const,
        theme: 'DARK' as const
      };

      const result = ValidationService.safeValidate(schemas.user, userData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});

describe('User Schema', () => {
  it('should validate complete user object', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      bio: 'Software developer',
      location: 'New York',
      website: 'https://johndoe.com',
      timezone: 'UTC',
      language: 'en' as const,
      theme: 'DARK' as const,
      status: 'ONLINE' as const,
      statusMessage: 'Available'
    };

    const result = schemas.user.parse(user);
    expect(result).toEqual(user);
  });

  it('should validate minimal user object', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'UTC',
      language: 'en' as const,
      theme: 'DARK' as const
    };

    const result = schemas.user.parse(user);
    expect(result).toEqual(user);
  });

  it('should reject invalid email', () => {
    const user = {
      name: 'John Doe',
      email: 'invalid-email',
      timezone: 'UTC',
      language: 'en' as const,
      theme: 'DARK' as const
    };

    expect(() => schemas.user.parse(user)).toThrow();
  });

  it('should reject invalid language', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'UTC',
      language: 'invalid' as any,
      theme: 'DARK' as const
    };

    expect(() => schemas.user.parse(user)).toThrow();
  });

  it('should reject invalid theme', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'UTC',
      language: 'en' as const,
      theme: 'INVALID' as any
    };

    expect(() => schemas.user.parse(user)).toThrow();
  });
});

describe('Workspace Schema', () => {
  it('should validate workspace', () => {
    const workspace = {
      name: 'My Workspace',
      slug: 'my-workspace',
      description: 'A test workspace'
    };

    const result = schemas.workspace.parse(workspace);
    expect(result).toEqual(workspace);
  });

  it('should reject invalid slug', () => {
    const workspace = {
      name: 'My Workspace',
      slug: 'My Workspace', // Invalid: contains spaces and uppercase
      description: 'A test workspace'
    };

    expect(() => schemas.workspace.parse(workspace)).toThrow();
  });
});

describe('Issue Schema', () => {
  it('should validate issue', () => {
    const issue = {
      title: 'Fix bug in authentication',
      description: 'The authentication system has a bug',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      type: 'BUG' as const,
      projectId: 'proj-123',
      reporterId: 'user-123',
      assigneeId: 'user-456',
      estimatedHours: 8,
      actualHours: 6
    };

    const result = schemas.issue.parse(issue);
    expect(result).toEqual(issue);
  });

  it('should reject invalid status', () => {
    const issue = {
      title: 'Fix bug in authentication',
      status: 'INVALID' as any,
      priority: 'HIGH' as const,
      type: 'BUG' as const,
      projectId: 'proj-123',
      reporterId: 'user-123'
    };

    expect(() => schemas.issue.parse(issue)).toThrow();
  });

  it('should reject negative hours', () => {
    const issue = {
      title: 'Fix bug in authentication',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      type: 'BUG' as const,
      projectId: 'proj-123',
      reporterId: 'user-123',
      estimatedHours: -5
    };

    expect(() => schemas.issue.parse(issue)).toThrow();
  });
});

describe('AI Chat Schema', () => {
  it('should validate AI chat message', () => {
    const chat = {
      message: 'Hello, how can I help you?',
      workspaceId: 'ws-123',
      projectId: 'proj-123',
      context: {
        previousMessages: [
          {
            role: 'user' as const,
            content: 'Hello',
            timestamp: new Date()
          }
        ],
        userActivity: 'coding',
        timeOfDay: 14
      }
    };

    const result = schemas.aiChat.parse(chat);
    expect(result).toEqual(chat);
  });

  it('should reject empty message', () => {
    const chat = {
      message: '',
      workspaceId: 'ws-123'
    };

    expect(() => schemas.aiChat.parse(chat)).toThrow();
  });

  it('should reject message that is too long', () => {
    const chat = {
      message: 'a'.repeat(4001), // Too long
      workspaceId: 'ws-123'
    };

    expect(() => schemas.aiChat.parse(chat)).toThrow();
  });
});

describe('Search Schema', () => {
  it('should validate search query', () => {
    const search = {
      query: 'test search',
      type: 'all' as const,
      workspaceId: 'ws-123',
      limit: 20,
      offset: 0
    };

    const result = schemas.search.parse(search);
    expect(result).toEqual(search);
  });

  it('should reject empty query', () => {
    const search = {
      query: '',
      type: 'all' as const
    };

    expect(() => schemas.search.parse(search)).toThrow();
  });

  it('should reject invalid limit', () => {
    const search = {
      query: 'test',
      limit: 150 // Too high
    };

    expect(() => schemas.search.parse(search)).toThrow();
  });
});

describe('Pagination Schema', () => {
  it('should validate pagination', () => {
    const pagination = {
      page: 2,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };

    const result = schemas.pagination.parse(pagination);
    expect(result).toEqual(pagination);
  });

  it('should reject invalid page', () => {
    const pagination = {
      page: 0, // Invalid: must be >= 1
      limit: 20
    };

    expect(() => schemas.pagination.parse(pagination)).toThrow();
  });

  it('should reject invalid sort order', () => {
    const pagination = {
      page: 1,
      limit: 20,
      sortOrder: 'invalid' as any
    };

    expect(() => schemas.pagination.parse(pagination)).toThrow();
  });
});

describe('File Upload Schema', () => {
  it('should validate file upload', () => {
    const file = {
      type: 'image' as const,
      size: 1024 * 1024, // 1MB
      mimeType: 'image/jpeg'
    };

    const result = schemas.fileUpload.parse(file);
    expect(result).toEqual(file);
  });

  it('should reject file that is too large', () => {
    const file = {
      type: 'image' as const,
      size: 11 * 1024 * 1024, // 11MB - too large
      mimeType: 'image/jpeg'
    };

    expect(() => schemas.fileUpload.parse(file)).toThrow();
  });

  it('should reject invalid MIME type', () => {
    const file = {
      type: 'image' as const,
      size: 1024 * 1024,
      mimeType: 'invalid/mime'
    };

    expect(() => schemas.fileUpload.parse(file)).toThrow();
  });
});

describe('Utility Schemas', () => {
  describe('ID Schema', () => {
    it('should validate valid IDs', () => {
      const validIds = ['user-123', 'proj_456', 'ws-789', 'task-abc-123'];
      
      validIds.forEach(id => {
        expect(() => schemas.id.parse(id)).not.toThrow();
      });
    });

    it('should reject invalid IDs', () => {
      const invalidIds = ['', 'user@123', 'proj 456', 'ws-789!'];
      
      invalidIds.forEach(id => {
        expect(() => schemas.id.parse(id)).toThrow();
      });
    });
  });

  describe('Email Schema', () => {
    it('should validate valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@subdomain.example.org'
      ];
      
      validEmails.forEach(email => {
        expect(() => schemas.email.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(() => schemas.email.parse(email)).toThrow();
      });
    });
  });

  describe('URL Schema', () => {
    it('should validate valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path?query=value'
      ];
      
      validUrls.forEach(url => {
        expect(() => schemas.url.parse(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'https://',
        'example.com'
      ];
      
      invalidUrls.forEach(url => {
        expect(() => schemas.url.parse(url)).toThrow();
      });
    });
  });
});

import { GET, POST, PATCH } from '@/app/api/code-review/route';
import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (url: string, body?: any) => {
  const request = new NextRequest(url);
  if (body) {
    request.json = jest.fn().mockResolvedValue(body);
  }
  return request;
};

describe('/api/code-review', () => {
  describe('GET', () => {
    it('returns all code reviews by default', async () => {
      const request = createMockRequest('http://localhost:3000/api/code-review');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reviews');
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.reviews.length).toBeGreaterThan(0);
    });

    it('filters reviews by status', async () => {
      const request = createMockRequest('http://localhost:3000/api/code-review?status=APPROVED');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.every((review: any) => review.status === 'APPROVED')).toBe(true);
    });

    it('filters reviews by score', async () => {
      const request = createMockRequest('http://localhost:3000/api/code-review?score=high');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.every((review: any) => review.overallScore >= 80)).toBe(true);
    });

    it('filters reviews by repository', async () => {
      const request = createMockRequest('http://localhost:3000/api/code-review?repositoryId=deadline-project');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.every((review: any) => review.repositoryId === 'deadline-project')).toBe(true);
    });

    it('returns reviews with correct structure', async () => {
      const request = createMockRequest('http://localhost:3000/api/code-review');
      const response = await GET(request);
      const data = await response.json();

      if (data.reviews.length > 0) {
        const review = data.reviews[0];
        expect(review).toHaveProperty('id');
        expect(review).toHaveProperty('pullRequestId');
        expect(review).toHaveProperty('repositoryId');
        expect(review).toHaveProperty('authorId');
        expect(review).toHaveProperty('aiReviewerId');
        expect(review).toHaveProperty('status');
        expect(review).toHaveProperty('overallScore');
        expect(review).toHaveProperty('reviewDate');
        expect(review).toHaveProperty('aiAnalysis');
        expect(review).toHaveProperty('issues');
        expect(review).toHaveProperty('recommendations');
        expect(review).toHaveProperty('aiReviewer');

        // Check aiAnalysis structure
        expect(review.aiAnalysis).toHaveProperty('codeQuality');
        expect(review.aiAnalysis).toHaveProperty('performance');
        expect(review.aiAnalysis).toHaveProperty('security');
        expect(review.aiAnalysis).toHaveProperty('maintainability');
        expect(review.aiAnalysis).toHaveProperty('testCoverage');

        // Check aiReviewer structure
        expect(review.aiReviewer).toHaveProperty('id');
        expect(review.aiReviewer).toHaveProperty('name');
        expect(review.aiReviewer).toHaveProperty('specialization');
        expect(review.aiReviewer).toHaveProperty('confidence');
      }
    });
  });

  describe('POST', () => {
    it('creates new code review', async () => {
      const body = {
        pullRequestId: 'PR-999',
        repositoryId: 'test-repo',
        authorId: 'user-1',
        codeContent: 'const test = "hello";',
        filePath: 'src/test.js'
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('pullRequestId', 'PR-999');
      expect(data).toHaveProperty('repositoryId', 'test-repo');
      expect(data).toHaveProperty('authorId', 'user-1');
      expect(data).toHaveProperty('status', 'PENDING');
      expect(data).toHaveProperty('overallScore');
      expect(data).toHaveProperty('aiAnalysis');
      expect(data).toHaveProperty('issues');
      expect(data).toHaveProperty('recommendations');
      expect(data).toHaveProperty('aiReviewer');
    });

    it('returns review with valid score range', async () => {
      const body = {
        pullRequestId: 'PR-999',
        repositoryId: 'test-repo',
        authorId: 'user-1',
        codeContent: 'const test = "hello";',
        filePath: 'src/test.js'
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await POST(request);
      const data = await response.json();

      expect(data.overallScore).toBeGreaterThanOrEqual(60);
      expect(data.overallScore).toBeLessThanOrEqual(100);
    });

    it('returns review with valid analysis scores', async () => {
      const body = {
        pullRequestId: 'PR-999',
        repositoryId: 'test-repo',
        authorId: 'user-1',
        codeContent: 'const test = "hello";',
        filePath: 'src/test.js'
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await POST(request);
      const data = await response.json();

      expect(data.aiAnalysis.codeQuality).toBeGreaterThanOrEqual(70);
      expect(data.aiAnalysis.codeQuality).toBeLessThanOrEqual(100);
      expect(data.aiAnalysis.performance).toBeGreaterThanOrEqual(70);
      expect(data.aiAnalysis.performance).toBeLessThanOrEqual(100);
      expect(data.aiAnalysis.security).toBeGreaterThanOrEqual(70);
      expect(data.aiAnalysis.security).toBeLessThanOrEqual(100);
      expect(data.aiAnalysis.maintainability).toBeGreaterThanOrEqual(70);
      expect(data.aiAnalysis.maintainability).toBeLessThanOrEqual(100);
      expect(data.aiAnalysis.testCoverage).toBeGreaterThanOrEqual(70);
      expect(data.aiAnalysis.testCoverage).toBeLessThanOrEqual(100);
    });
  });

  describe('PATCH', () => {
    it('updates review status', async () => {
      const body = {
        reviewId: 'review_1',
        status: 'APPROVED',
        comments: ['Great work!']
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'review_1');
      expect(data).toHaveProperty('status', 'APPROVED');
      expect(data).toHaveProperty('updatedAt');
      expect(data).toHaveProperty('comments', ['Great work!']);
    });

    it('handles status update without comments', async () => {
      const body = {
        reviewId: 'review_1',
        status: 'IN_PROGRESS'
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'review_1');
      expect(data).toHaveProperty('status', 'IN_PROGRESS');
      expect(data).toHaveProperty('comments', []);
    });

    it('handles update without status', async () => {
      const body = {
        reviewId: 'review_1',
        comments: ['Updated comments']
      };

      const request = createMockRequest('http://localhost:3000/api/code-review', body);
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'review_1');
      expect(data).toHaveProperty('status', 'IN_PROGRESS');
      expect(data).toHaveProperty('comments', ['Updated comments']);
    });
  });
});

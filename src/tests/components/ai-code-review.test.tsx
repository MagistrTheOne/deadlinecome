import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AICodeReviewDashboard from '@/components/ui/ai-code-review-dashboard';

// Mock fetch
global.fetch = jest.fn();

describe('AI Code Review Dashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    render(<AICodeReviewDashboard />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('renders code reviews after loading', async () => {
    const mockReviews = [
      {
        id: "review_1",
        pullRequestId: "PR-123",
        repositoryId: "test-repo",
        authorId: "user_1",
        aiReviewerId: "ai-vladimir",
        status: "APPROVED",
        overallScore: 92,
        reviewDate: new Date().toISOString(),
        aiAnalysis: {
          codeQuality: 95,
          performance: 88,
          security: 94,
          maintainability: 91,
          testCoverage: 87
        },
        issues: [],
        recommendations: ["Add more tests"],
        aiReviewer: {
          id: "ai-vladimir",
          name: "Владимир (AI Code Reviewer)",
          specialization: "Code Quality & Architecture",
          confidence: 94
        }
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: mockReviews }),
    });

    render(<AICodeReviewDashboard />);

    await waitFor(() => {
      expect(screen.getByText('PR-123')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });

  it('filters reviews by status', async () => {
    const mockReviews = [
      {
        id: "review_1",
        pullRequestId: "PR-123",
        repositoryId: "test-repo",
        authorId: "user_1",
        aiReviewerId: "ai-vladimir",
        status: "APPROVED",
        overallScore: 92,
        reviewDate: new Date().toISOString(),
        aiAnalysis: {
          codeQuality: 95,
          performance: 88,
          security: 94,
          maintainability: 91,
          testCoverage: 87
        },
        issues: [],
        recommendations: [],
        aiReviewer: {
          id: "ai-vladimir",
          name: "Владимир (AI Code Reviewer)",
          specialization: "Code Quality & Architecture",
          confidence: 94
        }
      },
      {
        id: "review_2",
        pullRequestId: "PR-124",
        repositoryId: "test-repo",
        authorId: "user_2",
        aiReviewerId: "ai-vladimir",
        status: "REJECTED",
        overallScore: 65,
        reviewDate: new Date().toISOString(),
        aiAnalysis: {
          codeQuality: 70,
          performance: 60,
          security: 75,
          maintainability: 68,
          testCoverage: 45
        },
        issues: [],
        recommendations: [],
        aiReviewer: {
          id: "ai-vladimir",
          name: "Владимир (AI Code Reviewer)",
          specialization: "Code Quality & Architecture",
          confidence: 89
        }
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: mockReviews }),
    });

    render(<AICodeReviewDashboard />);

    await waitFor(() => {
      expect(screen.getByText('PR-123')).toBeInTheDocument();
      expect(screen.getByText('PR-124')).toBeInTheDocument();
    });

    // Filter by APPROVED status
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: [mockReviews[0]] }),
    });

    const statusFilter = screen.getByDisplayValue('Все статусы');
    fireEvent.change(statusFilter, { target: { value: 'APPROVED' } });

    await waitFor(() => {
      expect(screen.getByText('PR-123')).toBeInTheDocument();
      expect(screen.queryByText('PR-124')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<AICodeReviewDashboard />);

    await waitFor(() => {
      // Should fallback to demo data
      expect(screen.getByText('PR-123')).toBeInTheDocument();
    });
  });

  it('displays review details correctly', async () => {
    const mockReview = {
      id: "review_1",
      pullRequestId: "PR-123",
      repositoryId: "test-repo",
      authorId: "user_1",
      aiReviewerId: "ai-vladimir",
      status: "APPROVED",
      overallScore: 92,
      reviewDate: new Date().toISOString(),
      aiAnalysis: {
        codeQuality: 95,
        performance: 88,
        security: 94,
        maintainability: 91,
        testCoverage: 87
      },
      issues: [
        {
          id: "issue_1",
          type: "STYLE",
          severity: "LOW",
          line: 45,
          message: "Use const instead of let",
          suggestion: "const userRole = getUserRole();"
        }
      ],
      recommendations: ["Add more tests", "Improve error handling"],
      aiReviewer: {
        id: "ai-vladimir",
        name: "Владимир (AI Code Reviewer)",
        specialization: "Code Quality & Architecture",
        confidence: 94
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: [mockReview] }),
    });

    render(<AICodeReviewDashboard />);

    await waitFor(() => {
      expect(screen.getByText('PR-123')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
      expect(screen.getByText('Владимир (AI Code Reviewer)')).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '@/components/ui/user-profile';

// Mock fetch
global.fetch = jest.fn();

describe('UserProfile Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    render(<UserProfile />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders user profile data after loading', async () => {
    const mockProfile = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: {
        name: "Developer",
        level: "senior",
        department: "Engineering",
        skills: ["React", "TypeScript"]
      },
      stats: {
        completedTasks: 10,
        totalTasks: 15,
        productivity: 85,
        streak: 5,
        rating: 4.5,
        hoursWorked: 40
      },
      currentTasks: [],
      recentActivity: [],
      achievements: [],
      teamMood: {
        personal: "happy",
        stress: 20,
        energy: 80,
        satisfaction: 90
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<UserProfile />);

    await waitFor(() => {
      // Should fallback to demo data
      expect(screen.getByText('MagistrTheOne')).toBeInTheDocument();
    });
  });

  it('displays user statistics correctly', async () => {
    const mockProfile = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: {
        name: "Developer",
        level: "senior",
        department: "Engineering",
        skills: ["React"]
      },
      stats: {
        completedTasks: 8,
        totalTasks: 10,
        productivity: 80,
        streak: 3,
        rating: 4.2,
        hoursWorked: 32
      },
      currentTasks: [],
      recentActivity: [],
      achievements: [],
      teamMood: {
        personal: "focused",
        stress: 30,
        energy: 70,
        satisfaction: 85
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument(); // completedTasks
      expect(screen.getByText('80%')).toBeInTheDocument(); // productivity
      expect(screen.getByText('3')).toBeInTheDocument(); // streak
      expect(screen.getByText('4.2')).toBeInTheDocument(); // rating
    });
  });

  it('displays current tasks', async () => {
    const mockProfile = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: {
        name: "Developer",
        level: "senior",
        department: "Engineering",
        skills: ["React"]
      },
      stats: {
        completedTasks: 5,
        totalTasks: 10,
        productivity: 80,
        streak: 3,
        rating: 4.2,
        hoursWorked: 32
      },
      currentTasks: [
        {
          id: "task-1",
          title: "Test Task",
          status: "IN_PROGRESS",
          priority: "HIGH",
          project: "Test Project"
        }
      ],
      recentActivity: [],
      achievements: [],
      teamMood: {
        personal: "focused",
        stress: 30,
        energy: 70,
        satisfaction: 85
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });
  });
});

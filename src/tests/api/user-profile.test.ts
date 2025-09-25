import { GET, PATCH } from '@/app/api/user/profile/route';
import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (url: string) => {
  return new NextRequest(url);
};

describe('/api/user/profile', () => {
  describe('GET', () => {
    it('returns user profile data', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile?userId=user-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'user-1');
      expect(data).toHaveProperty('name', 'MagistrTheOne');
      expect(data).toHaveProperty('email', 'maxonyushko71@gmail.com');
      expect(data).toHaveProperty('role');
      expect(data).toHaveProperty('stats');
      expect(data).toHaveProperty('currentTasks');
      expect(data).toHaveProperty('recentActivity');
      expect(data).toHaveProperty('achievements');
      expect(data).toHaveProperty('teamMood');
    });

    it('returns error when userId is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'UserId parameter is required');
    });

    it('returns user profile with correct structure', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile?userId=user-1');
      const response = await GET(request);
      const data = await response.json();

      // Check role structure
      expect(data.role).toHaveProperty('name');
      expect(data.role).toHaveProperty('level');
      expect(data.role).toHaveProperty('department');
      expect(data.role).toHaveProperty('skills');
      expect(Array.isArray(data.role.skills)).toBe(true);

      // Check stats structure
      expect(data.stats).toHaveProperty('completedTasks');
      expect(data.stats).toHaveProperty('totalTasks');
      expect(data.stats).toHaveProperty('productivity');
      expect(data.stats).toHaveProperty('streak');
      expect(data.stats).toHaveProperty('rating');
      expect(data.stats).toHaveProperty('hoursWorked');

      // Check currentTasks structure
      expect(Array.isArray(data.currentTasks)).toBe(true);
      if (data.currentTasks.length > 0) {
        const task = data.currentTasks[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('project');
      }

      // Check teamMood structure
      expect(data.teamMood).toHaveProperty('personal');
      expect(data.teamMood).toHaveProperty('stress');
      expect(data.teamMood).toHaveProperty('energy');
      expect(data.teamMood).toHaveProperty('satisfaction');
    });
  });

  describe('PATCH', () => {
    it('updates user profile successfully', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile');
      const body = {
        userId: 'user-1',
        updates: {
          name: 'Updated Name',
          stats: {
            completedTasks: 50,
            totalTasks: 60,
            productivity: 90,
            streak: 15,
            rating: 5.0,
            hoursWorked: 200
          }
        }
      };

      // Mock request body
      request.json = jest.fn().mockResolvedValue(body);

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'user-1');
      expect(data).toHaveProperty('name', 'Updated Name');
      expect(data.stats.completedTasks).toBe(50);
      expect(data.stats.productivity).toBe(90);
    });

    it('returns error when userId is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile');
      const body = {
        updates: {
          name: 'Updated Name'
        }
      };

      request.json = jest.fn().mockResolvedValue(body);

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'UserId parameter is required');
    });

    it('handles partial updates correctly', async () => {
      const request = createMockRequest('http://localhost:3000/api/user/profile');
      const body = {
        userId: 'user-1',
        updates: {
          teamMood: {
            personal: 'excited',
            stress: 10,
            energy: 95,
            satisfaction: 98
          }
        }
      };

      request.json = jest.fn().mockResolvedValue(body);

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.teamMood.personal).toBe('excited');
      expect(data.teamMood.stress).toBe(10);
      expect(data.teamMood.energy).toBe(95);
      expect(data.teamMood.satisfaction).toBe(98);
    });
  });
});

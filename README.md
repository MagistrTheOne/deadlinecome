# DeadLine - Jira-like SaaS

Modern project management tool built with Next.js 15.5, TypeScript, and Tailwind CSS. Inspired by Jira with drag-and-drop Kanban boards, issue tracking, and team collaboration features.

## Features

- **Kanban Board**: Drag and drop issues between columns (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- **Issue Management**: Create, edit, and track issues with priorities, types, and labels
- **Project Organization**: Manage multiple projects within workspaces
- **Team Collaboration**: Invite team members and manage permissions
- **Dark Theme**: Built with dark theme by default (no light theme toggle)
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives
- **Drag & Drop**: @dnd-kit
- **State Management**: TanStack Query + Zustand
- **Validation**: Zod
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd deadline
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (marketing)/       # Landing page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (sidebar, topbar)
│   ├── ui/               # shadcn/ui components
│   └── common/           # Common components
├── features/             # Feature-specific components
│   ├── issues/           # Issue management
│   ├── board/            # Kanban board
│   └── [feature]/        # Other features
├── lib/                  # Utilities and configurations
├── data/                 # In-memory data layer (MVP)
└── styles/               # Global styles
```

## Features Overview

### Authentication
- Mock authentication system (demo mode)
- Sign in and sign up forms
- Session management with localStorage

### Dashboard
- Project overview with statistics
- Recent activity feed
- Quick actions and navigation

### Projects
- Project listing and management
- Project settings and team management
- Multiple projects per workspace

### Kanban Board
- Drag and drop between columns
- Issue cards with priority, type, and assignee
- Real-time updates with optimistic UI
- Create new issues directly from board

### Issues
- Create, edit, and delete issues
- Priority levels (Low, Medium, High, Critical)
- Issue types (Task, Bug, Story)
- Labels and story points
- Assignee management

### Team Management
- Invite and manage team members
- Role-based permissions (Owner, Admin, Member, Viewer)
- Workspace-level member management

## Data Layer (MVP)

The application currently uses an in-memory data layer with seed data:

- **Workspaces**: Demo workspace with sample data
- **Projects**: 3 sample projects (Website Redesign, API Development, Mobile App)
- **Issues**: 10 sample issues across different projects and statuses
- **Members**: 4 sample team members

### Seed Data
- 2 workspaces (Demo, Personal)
- 3 projects with realistic data
- 10+ issues with various statuses and properties
- Team members with different roles

## Future Backend Integration

The data layer is designed to be easily replaceable with a real backend:

1. Replace in-memory repositories with database implementations
2. Add authentication with NextAuth.js
3. Implement real-time updates with WebSockets
4. Add file uploads and attachments
5. Implement advanced reporting and analytics

## Database Schema (Planned)

```sql
-- Workspaces
CREATE TABLE workspaces (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL
);

-- Users and Members
CREATE TABLE members (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  workspace_id VARCHAR REFERENCES workspaces(id),
  role VARCHAR CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'))
);

-- Projects
CREATE TABLE projects (
  id VARCHAR PRIMARY KEY,
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  workspace_id VARCHAR REFERENCES workspaces(id),
  lead_id VARCHAR REFERENCES members(id)
);

-- Issues
CREATE TABLE issues (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR REFERENCES projects(id),
  key VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR CHECK (type IN ('TASK', 'BUG', 'STORY')),
  status VARCHAR CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
  priority VARCHAR CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assignee_id VARCHAR REFERENCES members(id),
  reporter_id VARCHAR REFERENCES members(id),
  labels TEXT[],
  story_points INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**MagistrTheOne**

Built with ❤️ using Next.js and modern web technologies.
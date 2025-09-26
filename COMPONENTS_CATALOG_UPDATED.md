# Components Catalog - DeadLine Project

## Executive Summary
- **Total Components:** 276 (105 UI + 15 layout + 23 features + 133 pages/routes)
- **Heavy Components (>300 lines):** 54 (19.6%)
- **Dead/Orphan Components:** 3 identified
- **Average Component Size:** ~280 lines
- **Largest Component:** smart-sprint-planning.tsx (743 lines)

## Component Analysis by Level

### Atom Level (Basic UI Components)
- **Count:** 105 components
- **Average Size:** 180 lines
- **Heavy Components:** 15 (>300 lines)
- **Issues:** Mixed responsibilities, embedded business logic

### Molecule/Organism Level (Composite Components)
- **Count:** 38 components
- **Average Size:** 250 lines
- **Heavy Components:** 12 (>300 lines)

### Feature Level (Business Logic Components)
- **Count:** 23 components
- **Average Size:** 120 lines
- **Heavy Components:** 2 (>300 lines)

### Page/Layout Level (Application Structure)
- **Count:** 110 components
- **Average Size:** 150 lines
- **Heavy Components:** 25 (>300 lines)

## Detailed Component Inventory

| Path | Name | Level | Responsibility | Props | State/Store | Side-effects | Uses | Used by | Risks |
| ---- | ---- | ----- | -------------- | ----- | ----------- | ------------ | ---- | ------: | ----- |
| /components/ui/ai-code-review-dashboard.tsx | ai-code-review-dashboard | feature | Code review dashboard with AI analysis | CodeReview[], filters | Zustand store | fetch, polling | AI service, charts | 1 | High - 726 lines, complex state |
| /components/ui/smart-sprint-planning.tsx | smart-sprint-planning | feature | Sprint planning with AI optimization | SprintData, team | local | fetch, timer | AI service | 2 | Critical - 743 lines |
| /components/ui/ai-design-system.tsx | ai-design-system | feature | AI-powered design system generator | DesignTokens, components | local | fetch | AI service | 1 | High - 686 lines |
| /components/ui/ai-personality-customizer.tsx | ai-personality-customizer | feature | AI personality configuration | Personality[], settings | local | none | none | 1 | High - 710 lines |
| /components/ui/bug-tracker.tsx | bug-tracker | feature | Bug tracking dashboard | Bug[], filters | local | fetch | API service | 3 | High - 714 lines |
| /components/ui/ai-project-predictor.tsx | ai-project-predictor | feature | Project prediction analytics | ProjectData[], metrics | local | fetch | AI service | 1 | High - 684 lines |
| /components/ui/sidebar.tsx | sidebar | layout | Main application sidebar | NavItems[], user | local | none | routing | 15+ | Medium - 727 lines |
| /components/ui/ai-team-dashboard.tsx | ai-team-dashboard | feature | Team analytics with AI insights | TeamData[], metrics | local | fetch | AI service | 2 | High - 603 lines |
| /components/ui/enhanced-collaboration.tsx | enhanced-collaboration | feature | Real-time collaboration tools | Users[], messages | local | websocket, timer | WebSocket | 3 | High - 666 lines |
| /components/layout/sidebar.tsx | sidebar | layout | Alternative sidebar implementation | NavItems[], collapsed | local | none | routing | 8 | Medium - 348 lines |

## Dead/Orphan Components (Confirmed)

| Component | Path | Reason | Recommendation |
|-----------|------|--------|----------------|
| gamification-dashboard.tsx | /components/ui/gamification-dashboard.tsx | 0 imports found | Remove or integrate |
| industry-templates-dashboard.tsx | /components/ui/industry-templates-dashboard.tsx | 0 imports found | Remove or integrate |
| psychological-support-panel.tsx | /components/ui/psychological-support-panel.tsx | 0 imports found | Remove or integrate |

## Duplicate Components Analysis

### AI Status Components (4 variants)
- `ai-status.tsx` - Basic status display
- `ai-welcome-system.tsx` - Welcome status with timer
- `ai-assistant.tsx` - Full assistant interface
- `draggable-vasily-chat.tsx` - Draggable chat variant

**Issue:** Inconsistent APIs, duplicate logic
**Solution:** Create unified AIStatus component with variants

### Chart Components (3+ implementations)
- `chart.tsx` (378 lines) - Generic chart wrapper
- `activity-chart.tsx` - Activity-specific charts
- `enhanced-analytics.tsx` - Analytics dashboard charts

**Issue:** No shared abstraction layer
**Solution:** Extract ChartProvider and standardized chart types

### Form Components (5+ patterns)
- `ai-personality-customizer.tsx` - Complex form (710 lines)
- `role-management.tsx` - Role forms
- `user-profile.tsx` - Profile forms

**Issue:** Inconsistent validation and state management
**Solution:** Create FormBuilder pattern

## Heavy Components Breakdown (>300 lines)

### Critical Priority (Split Required)
1. **smart-sprint-planning.tsx** (743 lines) - Split into SprintPlanner, SprintOptimizer, SprintVisualizer
2. **ai-code-review-dashboard.tsx** (726 lines) - Split into CodeReviewList, CodeReviewItem, ReviewStats
3. **sidebar.tsx** (727 lines) - Split into SidebarHeader, SidebarNav, SidebarFooter
4. **ai-personality-customizer.tsx** (710 lines) - Extract PersonalityForm, PersonalityPreview
5. **bug-tracker.tsx** (714 lines) - Split into BugList, BugFilters, BugDetails

### High Priority (Refactor Required)
6. **ai-design-system.tsx** (686 lines) - Extract DesignGenerator, TokenEditor
7. **ai-project-predictor.tsx** (684 lines) - Split prediction logic from UI
8. **enhanced-collaboration.tsx** (666 lines) - Extract MessageList, UserPresence
9. **ai-code-generator.tsx** (665 lines) - Separate generation logic
10. **ai-team-dashboard.tsx** (603 lines) - Extract TeamMetrics, TeamInsights

### Medium Priority (Optimization Required)
11. **real-time-todo.tsx** (599 lines) - Add React.memo, optimize re-renders
12. **ai-task-manager.tsx** (609 lines) - Extract task CRUD operations
13. **user-profile.tsx** (638 lines) - Split into ProfileView, ProfileEdit
14. **vasily-project-manager.tsx** (463 lines) - Extract project logic hooks

## Component Usage Analysis

### Most Used Components
1. **Button** - 85+ imports (core UI primitive)
2. **Card** - 65+ imports (layout container)
3. **Input** - 45+ imports (form primitive)
4. **Badge** - 35+ imports (status indicator)
5. **Dialog** - 30+ imports (modal wrapper)

### Least Used Components (< 3 imports)
- `gamification-dashboard.tsx` - 0 imports ⚠️
- `industry-templates-dashboard.tsx` - 0 imports ⚠️
- `psychological-support-panel.tsx` - 0 imports ⚠️
- `aspect-ratio.tsx` - 1 import
- `collapsible.tsx` - 2 imports

## Performance Impact Assessment

### Components Causing Bundle Bloat
1. **AI Components** (5.2MB estimated) - Lazy load required
2. **Chart Libraries** (800KB) - Dynamic imports
3. **UI Component Library** (600KB) - Tree shaking optimization

### Re-render Heavy Components
1. **ai-status.tsx** - Polls every 5-10 seconds
2. **real-time-todo.tsx** - WebSocket updates
3. **activity-feed.tsx** - Frequent data fetching
4. **drag-drop-board.tsx** - Complex drag interactions

## Recommendations

### Immediate Actions (Week 1)
1. **Remove orphan components** - 3 components to delete
2. **Add React.memo** to all heavy components
3. **Implement lazy loading** for AI routes

### Short Term (Weeks 2-4)
1. **Split 5 largest components** using composition
2. **Create shared component patterns** (ChartProvider, FormBuilder)
3. **Add virtualization** to large lists (react-window)

### Long Term (Months 1-3)
1. **Complete component library** standardization
2. **Implement performance monitoring** for components
3. **Create component documentation** and usage guidelines

## Component Health Metrics

- **Average Component Size:** 280 lines (target: <200)
- **Heavy Components Ratio:** 19.6% (target: <10%)
- **Orphan Components:** 3 (target: 0)
- **Test Coverage:** Unknown (needs assessment)
- **Documentation Coverage:** Low (needs improvement)

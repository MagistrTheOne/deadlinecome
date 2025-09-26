# Components Catalog

| Path | Name | Level | Responsibility | Props | State/Store | Side-effects | Uses | Used by | Risks | LoC |
|---|---|---|---|---|---|---|---|---:|---|--:|
| src\components\auth\sign-in-form.tsx | sign-in-form | component | Form handling |  | None | None | React | 0 | None | 160 |
| src\components\auth\sign-up-form.tsx | sign-up-form | component | Form handling |  | None | None | React | 0 | None | 175 |
| src\components\auth\user-menu.tsx | user-menu | component | Navigation |  | None | None | None | 0 | None | 151 |
| src\components\common\loading.tsx | loading | component | UI component |  | None | None | None | 0 | None | 27 |
| src\components\features\ai\analytics-page-client.tsx | analytics-page-client | component | UI component |  | None | None | None | 0 | None | 67 |
| src\components\features\ai\design-page-client.tsx | design-page-client | component | UI component |  | None | None | None | 0 | None | 51 |
| src\components\features\ai\generator-page-client.tsx | generator-page-client | component | State management |  | None | None | None | 0 | None | 59 |
| src\components\features\ai\team-page-client.tsx | team-page-client | component | State management |  | 1 useState calls | None | None | 0 | Not memoized (has state) | 290 |
| src\components\features\ai\vasily-page-client.tsx | vasily-page-client | component | State management |  | 2 useState calls | 2 useEffect | React | 0 | Large component (>300 LoC); Not memoized (has state) | 426 |
| src\components\layout\app-sidebar.tsx | app-sidebar | component | UI component | workspaceId; isOpen; onClose | None | None | None | 0 | None | 117 |
| src\components\layout\app-topbar.tsx | app-topbar | component | State management | onMenuClick | None | None | None | 0 | None | 65 |
| src\components\layout\dashboard-layout.tsx | dashboard-layout | component | Page layout | children; label | None | None | React | 0 | None | 145 |
| src\components\layout\header.tsx | header | component | State management |  | None | None | None | 0 | None | 93 |
| src\components\layout\responsive-dashboard-layout.tsx | responsive-dashboard-layout | component | Page layout | children; label | None | 1 useEffect | React | 0 | None | 194 |
| src\components\layout\sidebar.tsx | sidebar | component | State management |  | None | None | None | 0 | Large component (>300 LoC) | 348 |
| src\components\layout\workspace-switcher.tsx | workspace-switcher | component | State management |  | 1 useState calls | None | None | 0 | Not memoized (has state) | 87 |
| src\components\ui\accordion.tsx | accordion | component | UI component |  | None | None | React | 0 | None | 67 |
| src\components\ui\activity-chart.tsx | activity-chart | component | Data visualization |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 153 |
| src\components\ui\activity-feed.tsx | activity-feed | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 296 |
| src\components\ui\advanced-automation-rules.tsx | advanced-automation-rules | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 477 |
| src\components\ui\advanced-features.tsx | advanced-features | component | State management |  | 2 useState calls | None | React | 0 | Large component (>300 LoC); Not memoized (has state) | 463 |
| src\components\ui\ai-assistant.tsx | ai-assistant | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 433 |
| src\components\ui\ai-code-generator.tsx | ai-code-generator | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 665 |
| src\components\ui\ai-code-review-dashboard.tsx | ai-code-review-dashboard | component | State management |  | 2 useState calls | 2 useEffect | React | 0 | Large component (>300 LoC); Not memoized (has state) | 726 |
| src\components\ui\ai-command-center.tsx | ai-command-center | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 525 |
| src\components\ui\ai-design-system.tsx | ai-design-system | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 686 |
| src\components\ui\ai-learning-dashboard.tsx | ai-learning-dashboard | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 205 |
| src\components\ui\ai-marketplace-dashboard.tsx | ai-marketplace-dashboard | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 315 |
| src\components\ui\ai-personality-customizer.tsx | ai-personality-customizer | component | State management |  | 3 useState calls | 2 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 710 |
| src\components\ui\ai-project-predictor.tsx | ai-project-predictor | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 684 |
| src\components\ui\ai-smart-workflows.tsx | ai-smart-workflows | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 523 |
| src\components\ui\ai-status.tsx | ai-status | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 279 |
| src\components\ui\ai-task-manager.tsx | ai-task-manager | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 609 |
| src\components\ui\ai-team-chat.tsx | ai-team-chat | component | State management |  | 3 useState calls | 2 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 490 |
| src\components\ui\ai-team-dashboard.tsx | ai-team-dashboard | component | State management |  | 3 useState calls | 2 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 603 |
| src\components\ui\ai-welcome-system.tsx | ai-welcome-system | component | State management | name; email | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 289 |
| src\components\ui\alert-dialog.tsx | alert-dialog | component | Modal/Dialog management |  | None | None | React | 0 | None | 158 |
| src\components\ui\alert.tsx | alert | component | UI component |  | None | None | React | 0 | None | 67 |
| src\components\ui\aspect-ratio.tsx | aspect-ratio | component | UI component |  | None | None | React | 0 | None | 12 |
| src\components\ui\avatar.tsx | avatar | component | UI component |  | None | None | React, forwardRef | 0 | None | 47 |
| src\components\ui\badge.tsx | badge | component | UI component |  | None | None | React | 0 | None | 35 |
| src\components\ui\billing-selector.tsx | billing-selector | component | State management |  | 1 useState calls | None | None | 0 | Weak typing; Not memoized (has state) | 235 |
| src\components\ui\board-manager.tsx | board-manager | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 579 |
| src\components\ui\breadcrumb.tsx | breadcrumb | component | UI component |  | None | None | React | 0 | None | 110 |
| src\components\ui\breadcrumbs.tsx | breadcrumbs | component | UI component | items | None | None | None | 0 | None | 47 |
| src\components\ui\bug-tracker.tsx | bug-tracker | component | State management |  | 2 useState calls | 1 useEffect | React | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 714 |
| src\components\ui\button.tsx | button | component | UI primitive |  | None | None | React, forwardRef | 0 | None | 56 |
| src\components\ui\calendar.tsx | calendar | component | UI component |  | None | None | React | 0 | None | 53 |
| src\components\ui\card.tsx | card | component | Content container |  | None | None | React, forwardRef | 0 | None | 70 |
| src\components\ui\carousel.tsx | carousel | component | State management |  |  Context | 2 useEffect | React, useCallback | 0 | None | 242 |
| src\components\ui\chart.tsx | chart | component | Data visualization |  |  Context | None | React, useMemo | 0 | Large component (>300 LoC); Weak typing | 378 |
| src\components\ui\checkbox.tsx | checkbox | component | UI component |  | None | None | React | 0 | None | 33 |
| src\components\ui\collapsible.tsx | collapsible | component | UI component |  | None | None | React | 0 | None | 34 |
| src\components\ui\command.tsx | command | component | UI component |  | None | None | React, forwardRef | 0 | None | 152 |
| src\components\ui\compact-chat.tsx | compact-chat | component | State management | isOpen; onToggle; onMinimize | 1 useState calls | 2 useEffect | React | 0 | Not memoized (has state) | 239 |
| src\components\ui\context-menu.tsx | context-menu | component | Navigation |  | None | None | React | 0 | None | 253 |
| src\components\ui\dialog.tsx | dialog | component | Modal/Dialog management |  | None | None | React, forwardRef | 0 | None | 119 |
| src\components\ui\drag-drop-board.tsx | drag-drop-board | component | State management | taskId; columnId | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 389 |
| src\components\ui\drag-drop-card.tsx | drag-drop-card | component | Content container | task; taskId | None | None | None | 0 | None | 156 |
| src\components\ui\drag-drop-column.tsx | drag-drop-column | component | UI component | column; columnId | None | None | None | 0 | None | 128 |
| src\components\ui\draggable-vasily-chat.tsx | draggable-vasily-chat | component | State management |  | 5 useState calls | 7 useEffect | React | 0 | Large component (>300 LoC); Multiple useEffect (>3); Not memoized (has state) | 452 |
| src\components\ui\drawer.tsx | drawer | component | UI component |  | None | None | React | 0 | None | 136 |
| src\components\ui\dropdown-menu.tsx | dropdown-menu | component | Navigation |  | None | None | React | 0 | None | 258 |
| src\components\ui\enhanced-analytics.tsx | enhanced-analytics | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 352 |
| src\components\ui\enhanced-collaboration.tsx | enhanced-collaboration | component | State management |  | 5 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 666 |
| src\components\ui\enhanced-navigation.tsx | enhanced-navigation | component | Navigation | isOpen; onToggle; onChatToggle; onChatMinimize | 1 useState calls | None | React | 0 | Not memoized (has state) | 286 |
| src\components\ui\form.tsx | form | component | Form handling |  |  Context | None | React | 0 | None | 168 |
| src\components\ui\gamification-dashboard.tsx | gamification-dashboard | component | State management |  | 5 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 439 |
| src\components\ui\global-teams-dashboard.tsx | global-teams-dashboard | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 333 |
| src\components\ui\hotkeys-modal.tsx | hotkeys-modal | component | Modal/Dialog management | isOpen; onClose | 1 useState calls | 1 useEffect | None | 0 | Weak typing; Not memoized (has state) | 181 |
| src\components\ui\hover-card.tsx | hover-card | component | Content container |  | None | None | React | 0 | None | 45 |
| src\components\ui\industry-templates-dashboard.tsx | industry-templates-dashboard | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 272 |
| src\components\ui\input-otp.tsx | input-otp | component | UI primitive |  |  Context | None | React | 0 | None | 78 |
| src\components\ui\input.tsx | input | component | UI primitive |  | None | None | React, forwardRef | 0 | None | 24 |
| src\components\ui\keyboard-shortcuts.tsx | keyboard-shortcuts | component | State management |  | None | 1 useEffect | React | 0 | None | 223 |
| src\components\ui\label.tsx | label | component | UI component |  | None | None | React | 0 | None | 25 |
| src\components\ui\loading-screen.tsx | loading-screen | component | State management |  | None | 2 useEffect | None | 0 | None | 131 |
| src\components\ui\loading-skeleton.tsx | loading-skeleton | component | UI component |  | None | None | None | 0 | None | 74 |
| src\components\ui\logo.tsx | logo | component | UI component |  | None | None | None | 0 | None | 107 |
| src\components\ui\menubar.tsx | menubar | component | Navigation |  | None | None | React | 0 | None | 277 |
| src\components\ui\navigation-menu.tsx | navigation-menu | component | Navigation |  | None | None | React | 0 | None | 169 |
| src\components\ui\notification-system.tsx | notification-system | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 253 |
| src\components\ui\optimized-components.tsx | optimized-components | component | State management | title; value | 3 useState calls | 3 useEffect | React, useCallback, useMemo | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 376 |
| src\components\ui\pagination.tsx | pagination | component | UI component |  | None | None | React | 0 | None | 128 |
| src\components\ui\pair-programming-studio.tsx | pair-programming-studio | component | State management |  | 3 useState calls | 1 useEffect | useCallback | 0 | Large component (>300 LoC); Not memoized (has state) | 536 |
| src\components\ui\popover.tsx | popover | component | UI component |  | None | None | React | 0 | None | 49 |
| src\components\ui\predictive-analytics.tsx | predictive-analytics | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 591 |
| src\components\ui\premium-animations.tsx | premium-animations | component | State management |  | None | 2 useEffect | React | 0 | None | 277 |
| src\components\ui\premium-dashboard-v2.tsx | premium-dashboard-v2 | component | State management |  | 1 useState calls | None | React | 0 | Large component (>300 LoC); Many dependencies (>15 imports); Not memoized (has state) | 522 |
| src\components\ui\progress.tsx | progress | component | UI component |  | None | None | React, forwardRef | 0 | None | 28 |
| src\components\ui\progressive-ux.tsx | progressive-ux | component | State management |  | 3 useState calls | 1 useEffect | React | 0 | Large component (>300 LoC); Not memoized (has state) | 454 |
| src\components\ui\psychological-support-panel.tsx | psychological-support-panel | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 361 |
| src\components\ui\quick-actions.tsx | quick-actions | component | State management |  | 1 useState calls | None | React | 0 | Large component (>300 LoC); Not memoized (has state) | 318 |
| src\components\ui\radio-group.tsx | radio-group | component | UI component |  | None | None | React | 0 | None | 46 |
| src\components\ui\real-time-collaboration.tsx | real-time-collaboration | component | State management |  | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 387 |
| src\components\ui\real-time-todo.tsx | real-time-todo | component | State management | projectId; workspaceId | 3 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 599 |
| src\components\ui\realtime-analytics-dashboard.tsx | realtime-analytics-dashboard | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 483 |
| src\components\ui\realtime-collaboration.tsx | realtime-collaboration | component | State management |  | 2 useState calls | 1 useEffect | useCallback | 0 | Large component (>300 LoC); Not memoized (has state) | 517 |
| src\components\ui\realtime-stats.tsx | realtime-stats | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 237 |
| src\components\ui\resizable.tsx | resizable | component | UI component |  | None | None | React | 0 | None | 57 |
| src\components\ui\role-management.tsx | role-management | component | State management | workspaceId | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 405 |
| src\components\ui\scroll-area.tsx | scroll-area | component | UI component |  | None | None | React | 0 | None | 59 |
| src\components\ui\select.tsx | select | component | UI component |  | None | None | React, forwardRef | 0 | None | 157 |
| src\components\ui\separator.tsx | separator | component | UI component |  | None | None | React | 0 | None | 29 |
| src\components\ui\sheet.tsx | sheet | component | UI component |  | None | None | React, forwardRef | 0 | None | 137 |
| src\components\ui\sidebar.tsx | sidebar | component | State management |  |  Context | 1 useEffect | React, useCallback, useMemo | 0 | Large component (>300 LoC) | 727 |
| src\components\ui\skeleton-loading.tsx | skeleton-loading | component | UI component |  | None | None | None | 0 | None | 143 |
| src\components\ui\skeleton.tsx | skeleton | component | UI component |  | None | None | React | 0 | None | 14 |
| src\components\ui\slider.tsx | slider | component | UI component |  | None | None | React, forwardRef | 0 | None | 28 |
| src\components\ui\smart-assignment.tsx | smart-assignment | component | State management |  | 1 useState calls | None | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 324 |
| src\components\ui\smart-sprint-planning.tsx | smart-sprint-planning | component | State management |  | 4 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 743 |
| src\components\ui\sonner.tsx | sonner | component | UI component |  | None | None | React | 0 | None | 23 |
| src\components\ui\switch.tsx | switch | component | UI component |  | None | None | React | 0 | None | 32 |
| src\components\ui\table.tsx | table | component | Data display |  | None | None | React | 0 | None | 117 |
| src\components\ui\tabs.tsx | tabs | component | UI component |  | None | None | React, forwardRef | 0 | None | 55 |
| src\components\ui\textarea.tsx | textarea | component | UI component |  | None | None | React, forwardRef | 0 | None | 24 |
| src\components\ui\toggle-group.tsx | toggle-group | component | UI component |  |  Context | None | React | 0 | None | 74 |
| src\components\ui\toggle.tsx | toggle | component | UI component |  | None | None | React | 0 | None | 48 |
| src\components\ui\tooltip.tsx | tooltip | component | UI component |  | None | None | React | 0 | None | 62 |
| src\components\ui\user-profile.tsx | user-profile | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 638 |
| src\components\ui\vasily-chat.tsx | vasily-chat | component | State management |  | 2 useState calls | 2 useEffect | React | 0 | Large component (>300 LoC); Not memoized (has state) | 333 |
| src\components\ui\vasily-floating-button.tsx | vasily-floating-button | component | UI primitive |  | 1 useState calls | None | None | 0 | Not memoized (has state) | 120 |
| src\components\ui\vasily-mood-control.tsx | vasily-mood-control | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 246 |
| src\components\ui\vasily-project-manager.tsx | vasily-project-manager | component | State management | projectId; workspaceId | 2 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Not memoized (has state) | 463 |
| src\components\ui\vasily-voice.tsx | vasily-voice | component | State management |  | 1 useState calls | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing; Not memoized (has state) | 325 |
| src\components\ui\voice-ai.tsx | voice-ai | component | State management | specialist; onVoiceResponse | None | 1 useEffect | None | 0 | Large component (>300 LoC); Weak typing | 426 |
| src\components\ui\websocket-stats.tsx | websocket-stats | component | State management |  | 2 useState calls | 1 useEffect | None | 0 | Not memoized (has state) | 166 |
| src\features\auth\components\auth-guard.tsx | auth-guard | component | Side effects | children | None | 1 useEffect | React | 0 | None | 33 |
| src\features\auth\components\user-profile.tsx | user-profile | component | Data fetching |  | None | None | None | 0 | None | 100 |
| src\features\board\components\board.tsx | board | component | State management |  | 2 useState calls | None | None | 0 | Not memoized (has state) | 244 |
| src\features\board\components\column.tsx | column | component | UI component | title; items; onCreateIssue; onIssueClick | None | None | None | 0 | None | 72 |
| src\features\issues\components\create-issue-dialog.tsx | create-issue-dialog | component | Modal/Dialog management | projectId; onCreate | None | None | React | 0 | None | 207 |
| src\features\issues\components\issue-card.tsx | issue-card | component | Content container | issue | None | None | None | 0 | None | 121 |
| src\features\issues\components\issue-drawer.tsx | issue-drawer | component | State management | issue; isOpen; onClose; onUpdate | 1 useState calls | None | None | 0 | Weak typing; Not memoized (has state) | 194 |
| src\features\issues\components\issue-filters.tsx | issue-filters | component | State management | id; name | None | None | None | 0 | Large component (>300 LoC) | 346 |
| src\tests\components\ai-code-review.test.tsx | ai-code-review.test | component | Data fetching |  | None | None | None | 0 | None | 201 |
| src\tests\components\user-profile.test.tsx | user-profile.test | component | Data fetching |  | None | None | None | 0 | None | 168 |

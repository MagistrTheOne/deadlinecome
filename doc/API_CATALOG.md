# API Catalog

| Path | Methods | Input Schema | Output Schema | Statuses | Auth | Rate-limit | Cache | Realtime | DB Touch | Risks |
| ---- | ------- | ------------ | ------------- | -------- | ---- | ---------- | ----- | -------- | -------- | ----- |
| /activity | GET | Zod schema | JSON | 401, 500 | session | no | none | none | ai_* | none |
| /activity/stats | GET | Zod schema | JSON | 401, 500 | session | no | none | none | tasks, ai_* | none |
| /ai/activity-monitor | GET, POST | None | JSON | 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/ask | POST | Zod schema | JSON | 400, 401, 500 | session | no | none | none | ai_* | non-idempotent-post |
| /ai/auto-documentation | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/auto-responses | POST | None | JSON | 401, 500 | session | no | none | none | projects, ai_* | missing-validation, non-idempotent-post |
| /ai/auto-tasks | GET, POST | None | JSON | 400, 500 | public | no | none | none | tasks, ai_* | missing-validation, non-idempotent-post |
| /ai/code-generation | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/command-center | GET, POST | None | JSON | 200, 400, 404, 500 | public | no | none | none | tasks, ai_* | missing-validation, non-idempotent-post |
| /ai/create-task | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | none | ai_* | non-idempotent-post |
| /ai/crisis-mode | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/custom-ai | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/design-system | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/emotional-intelligence | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/global-teams | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/industry-templates | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/learning | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/learning-system | GET, POST | None | JSON | 400, 500 | public | no | none | none | users, ai_* | missing-validation, non-idempotent-post |
| /ai/marketplace | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/mood | GET, POST | None | JSON | 400, 401, 500 | session | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/predictive-analytics | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/project-predictor | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/psychological-support | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/report | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | none | tasks, ai_* | non-idempotent-post |
| /ai/status | GET | None | JSON | 401, 500 | session | no | none | none | ai_* | missing-validation |
| /ai/suggestions | GET, POST | Zod schema | JSON | 400, 401, 500 | session | no | none | none | ai_* | non-idempotent-post |
| /ai/team-dynamics | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/team-mood | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai/vasily | POST | None | JSON | 429, 502, 503 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /ai-team | GET, POST | None | JSON | 500 | public | no | none | none | tasks, ai_* | missing-validation, non-idempotent-post |
| /analytics/burndown/[sprintId] | GET | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /analytics/cumulative-flow/[sprintId] | GET | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /analytics | GET, POST | Zod schema | JSON | 200, 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /analytics/sprint-stats/[sprintId] | GET, PUT | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /analytics/velocity/[sprintId] | GET | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /auth/[...auth] | GET, POST | None | JSON |  | session | no | none | none | none | missing-validation, non-idempotent-post |
| /automation/rules | GET, POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /automation/rules/[ruleId] | GET, PUT, DELETE | ValidationService | JSON | 200, 400, 404, 500 | public | yes | none | none | ai_* | none |
| /automation/trigger | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /boards | GET, POST | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/templates | GET, POST | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/[boardId]/analytics/columns | GET | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | weak-auth |
| /boards/[boardId]/analytics | GET, POST | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/[boardId]/analytics/users | GET | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, users, ai_* | weak-auth |
| /boards/[boardId]/archive | POST, PUT | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/[boardId]/columns | GET, POST | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/[boardId]/columns/[columnId] | GET, PUT, DELETE | ValidationService | JSON | 200, 400, 401, 404, 500 | session | yes | none | none | boards, ai_* | weak-auth |
| /boards/[boardId]/favorite | POST, DELETE | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /boards/[boardId] | GET, PUT, DELETE | ValidationService | JSON | 200, 400, 401, 404, 500 | session | yes | none | none | boards, ai_* | weak-auth |
| /boards/[boardId]/swimlanes | GET, POST | ValidationService | JSON | 200, 400, 401, 500 | session | yes | none | none | boards, ai_* | non-idempotent-post, weak-auth |
| /bugs | GET, POST, PATCH, DELETE | None | JSON | 400, 404, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /burnout-detection | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /cicd-assistant | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /code-review | GET, POST, PATCH | None | JSON | 500 | session | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /cost-optimization | POST | Zod schema | JSON | 200, 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /dashboard/stats | GET | ValidationService | JSON | 200, 400, 401, 500 | session | yes | Cache-Control | none | projects, tasks, workspaces, ai_* | weak-auth |
| /documentation-generator | GET, POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | Cache-Control | WebSocket | projects, tasks, users, ai_* | non-idempotent-post |
| /export/[type] | GET | ValidationService | JSON | 400, 404, 500 | public | yes | none | none | tasks, ai_* | none |
| /files/[category]/[filename] | GET, DELETE | None | JSON | 200, 400, 404, 500 | public | no | Cache-Control | none | ai_* | missing-validation |
| /files/[category]/[filename]/thumbnail | GET | None | JSON | 400, 404, 500 | public | no | Cache-Control | none | ai_* | missing-validation |
| /gamification | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /health |  | None | JSON |  | public | no | none | none | none | missing-validation |
| /integrations/github/auth | GET, POST | ValidationService | JSON | 200, 400, 500 | session | no | none | none | ai_* | non-idempotent-post |
| /integrations/github/repositories | GET | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /integrations/github/sync | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /integrations/github/webhook | POST | None | JSON | 200, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /integrations/jira/sync | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /integrations/slack/auth | GET, POST | ValidationService | JSON | 200, 400, 500 | session | no | none | none | users, ai_* | non-idempotent-post |
| /integrations/slack/commands | POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /integrations/slack/notify | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /meeting-assistant | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /metrics | GET | None | JSON |  | public | no | none | none | ai_* | missing-validation |
| /notifications | GET, POST | None | JSON | 400, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /notifications/send | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /performance-analyzer | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | users, ai_* | non-idempotent-post |
| /projects | GET, POST | None | JSON | 201, 400, 401, 500 | session | no | none | none | projects, ai_* | missing-validation, non-idempotent-post |
| /quality-gates | GET, POST, PUT, DELETE | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /realtime/events | POST | None | JSON | 500 | public | no | none | WebSocket | ai_* | missing-validation, non-idempotent-post |
| /realtime/history | GET | None | JSON | 500 | public | no | none | WebSocket | ai_* | missing-validation |
| /realtime/stats | GET | ValidationService | JSON | 200, 400, 401, 500 | session | yes | Cache-Control | WebSocket | ai_* | weak-auth |
| /realtime/updates | GET, POST | None | JSON | 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /roles | GET, POST, PATCH | None | JSON | 404, 500 | public | no | none | none | ai_* | missing-validation, non-idempotent-post |
| /security-scanner | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | users, ai_* | non-idempotent-post |
| /settings | GET, PUT | None | JSON | 401, 500 | session | no | none | none | ai_* | missing-validation, debug-leak |
| /sprint-planning | POST | Zod schema | JSON | 400, 401, 404, 500 | session | no | none | WebSocket | ai_* | non-idempotent-post |
| /tasks | GET, POST, PATCH, DELETE | None | JSON | 400, 404, 500 | public | no | none | WebSocket | ai_* | missing-validation, non-idempotent-post |
| /test-generation | POST | Zod schema | JSON | 200, 400, 401, 404, 500 | session | no | none | WebSocket | users, ai_* | non-idempotent-post |
| /time-tracking/export | GET | ValidationService | JSON | 400, 500 | public | yes | none | none | ai_* | none |
| /time-tracking/start | POST | ValidationService | JSON | 200, 400, 500 | session | yes | none | none | ai_* | non-idempotent-post |
| /time-tracking/stats | GET | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | none |
| /time-tracking/stop | POST | ValidationService | JSON | 200, 400, 404, 500 | session | yes | none | none | ai_* | non-idempotent-post |
| /upload | POST | ValidationService | JSON | 200, 400, 500 | public | yes | none | none | ai_* | non-idempotent-post |
| /user/avatar | POST | Zod schema | JSON | 400, 401, 500 | session | no | none | none | ai_* | non-idempotent-post |
| /user/profile | GET | Zod schema | JSON | 200, 400, 401, 500 | session | yes | Cache-Control | none | ai_* | none |
| /users | GET, PUT | Zod schema | JSON | 400, 401, 500 | session | no | none | none | users, ai_* | none |
| /vasily/auto-assign | POST | Zod schema | JSON | 400, 401, 500 | session | no | none | WebSocket | tasks, ai_* | non-idempotent-post |
| /vasily/chat |  | Zod schema | JSON | 200, 400, 401, 503 | session | yes | Cache-Control | none | ai_* | weak-auth |
| /vasily/project-status | GET, POST | Zod schema | JSON | 400, 401, 500 | session | no | none | WebSocket | tasks, ai_* | non-idempotent-post |
| /websocket | GET | None | JSON | 200 | public | no | none | WebSocket | none | missing-validation |
| /websocket/stats | GET | None | JSON | 500, 503 | public | no | none | WebSocket | none | missing-validation |
| /workspaces | GET, POST | None | JSON | 201, 401, 500 | session | no | none | none | workspaces, ai_* | missing-validation, non-idempotent-post |
| /ws | GET, POST | None | JSON | 400, 500 | public | no | none | WebSocket | ai_* | missing-validation, non-idempotent-post |

## API Map JSON

```json
{
  "/activity": {
    "methods": [
      "GET"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/activity/stats": {
    "methods": [
      "GET"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/activity-monitor": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/ask": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/auto-documentation": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/auto-responses": {
    "methods": [
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/auto-tasks": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/code-generation": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/command-center": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/create-task": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/crisis-mode": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/custom-ai": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/design-system": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/emotional-intelligence": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/global-teams": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/industry-templates": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/learning": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/learning-system": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/marketplace": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/mood": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/predictive-analytics": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/project-predictor": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/psychological-support": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/report": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/status": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/suggestions": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/team-dynamics": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/team-mood": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai/vasily": {
    "methods": [
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ai-team": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/analytics/burndown/[sprintId]": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/analytics/cumulative-flow/[sprintId]": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/analytics": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/analytics/sprint-stats/[sprintId]": {
    "methods": [
      "GET",
      "PUT"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/analytics/velocity/[sprintId]": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/auth/[...auth]": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/automation/rules": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/automation/rules/[ruleId]": {
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/automation/trigger": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/templates": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/analytics/columns": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/analytics": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/analytics/users": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/archive": {
    "methods": [
      "POST",
      "PUT"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/columns": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/columns/[columnId]": {
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/favorite": {
    "methods": [
      "POST",
      "DELETE"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]": {
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/boards/[boardId]/swimlanes": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/bugs": {
    "methods": [
      "GET",
      "POST",
      "PATCH",
      "DELETE"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/burnout-detection": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/cicd-assistant": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/code-review": {
    "methods": [
      "GET",
      "POST",
      "PATCH"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/cost-optimization": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/dashboard/stats": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "Cache-Control",
    "realtime": false
  },
  "/documentation-generator": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "Cache-Control",
    "realtime": true
  },
  "/export/[type]": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/files/[category]/[filename]": {
    "methods": [
      "GET",
      "DELETE"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "Cache-Control",
    "realtime": false
  },
  "/files/[category]/[filename]/thumbnail": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "Cache-Control",
    "realtime": false
  },
  "/gamification": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/health": {
    "methods": [
      ""
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/integrations/github/auth": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/integrations/github/repositories": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/integrations/github/sync": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/integrations/github/webhook": {
    "methods": [
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/integrations/jira/sync": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/integrations/slack/auth": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/integrations/slack/commands": {
    "methods": [
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/integrations/slack/notify": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/meeting-assistant": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/metrics": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/notifications": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/notifications/send": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/performance-analyzer": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/projects": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/quality-gates": {
    "methods": [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/realtime/events": {
    "methods": [
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/realtime/history": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/realtime/stats": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "Cache-Control",
    "realtime": true
  },
  "/realtime/updates": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/roles": {
    "methods": [
      "GET",
      "POST",
      "PATCH"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/security-scanner": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/settings": {
    "methods": [
      "GET",
      "PUT"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/sprint-planning": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/tasks": {
    "methods": [
      "GET",
      "POST",
      "PATCH",
      "DELETE"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/test-generation": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/time-tracking/export": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/time-tracking/start": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/time-tracking/stats": {
    "methods": [
      "GET"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/time-tracking/stop": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/upload": {
    "methods": [
      "POST"
    ],
    "input": "ValidationService",
    "output": "JSON",
    "auth": "public",
    "rateLimit": true,
    "cache": "none",
    "realtime": false
  },
  "/user/avatar": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/user/profile": {
    "methods": [
      "GET"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "Cache-Control",
    "realtime": false
  },
  "/users": {
    "methods": [
      "GET",
      "PUT"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/vasily/auto-assign": {
    "methods": [
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/vasily/chat": {
    "methods": [
      ""
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": true,
    "cache": "Cache-Control",
    "realtime": false
  },
  "/vasily/project-status": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "Zod schema",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/websocket": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/websocket/stats": {
    "methods": [
      "GET"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  },
  "/workspaces": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "session",
    "rateLimit": false,
    "cache": "none",
    "realtime": false
  },
  "/ws": {
    "methods": [
      "GET",
      "POST"
    ],
    "input": "None",
    "output": "JSON",
    "auth": "public",
    "rateLimit": false,
    "cache": "none",
    "realtime": true
  }
}
```


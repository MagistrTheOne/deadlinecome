"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { getIssuesByProject } from "@/features/issues/actions";
import { getProjectById, getIssuesByProject as getAllIssues } from "@/data/seed";
import { Issue, Project } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3
} from "lucide-react";

interface ReportsPageProps {
  params: { workspaceId: string };
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all projects for this workspace
        const workspaceProjects = [
          getProjectById("demo-project-1"),
          getProjectById("demo-project-2"),
          getProjectById("demo-project-3")
        ].filter(Boolean) as Project[];

        setProjects(workspaceProjects);

        // Load issues for all projects
        const allProjectIssues: Issue[] = [];
        for (const project of workspaceProjects) {
          const issues = await getIssuesByProject(project.id);
          allProjectIssues.push(...issues);
        }
        setAllIssues(allProjectIssues);
      } catch (error) {
        console.error("Failed to load reports data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.workspaceId]);

  // Calculate metrics
  const totalIssues = allIssues.length;
  const completedIssues = allIssues.filter(issue => issue.status === "DONE").length;
  const inProgressIssues = allIssues.filter(issue => issue.status === "IN_PROGRESS").length;
  const todoIssues = allIssues.filter(issue => issue.status === "TODO").length;
  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  // Status distribution for pie chart
  const statusData = [
    { name: "To Do", value: todoIssues, color: "#6b7280" },
    { name: "In Progress", value: inProgressIssues, color: "#3b82f6" },
    { name: "In Review", value: allIssues.filter(i => i.status === "IN_REVIEW").length, color: "#f59e0b" },
    { name: "Done", value: completedIssues, color: "#10b981" },
  ];

  // Issues by priority
  const priorityData = [
    { name: "Low", count: allIssues.filter(i => i.priority === "LOW").length, color: "#10b981" },
    { name: "Medium", count: allIssues.filter(i => i.priority === "MEDIUM").length, color: "#f59e0b" },
    { name: "High", count: allIssues.filter(i => i.priority === "HIGH").length, color: "#f97316" },
    { name: "Critical", count: allIssues.filter(i => i.priority === "CRITICAL").length, color: "#ef4444" },
  ];

  // Mock velocity data (last 7 days)
  const velocityData = [
    { day: "Mon", completed: 2, created: 3 },
    { day: "Tue", completed: 1, created: 2 },
    { day: "Wed", completed: 3, created: 1 },
    { day: "Thu", completed: 0, created: 4 },
    { day: "Fri", completed: 2, created: 2 },
    { day: "Sat", completed: 0, created: 0 },
    { day: "Sun", completed: 0, created: 1 },
  ];

  // Mock burndown data
  const burndownData = [
    { day: "Day 1", ideal: 20, actual: 20 },
    { day: "Day 2", ideal: 18, actual: 19 },
    { day: "Day 3", ideal: 16, actual: 17 },
    { day: "Day 4", ideal: 14, actual: 16 },
    { day: "Day 5", ideal: 12, actual: 14 },
    { day: "Day 6", ideal: 10, actual: 12 },
    { day: "Day 7", ideal: 8, actual: 9 },
    { day: "Day 8", ideal: 6, actual: 7 },
    { day: "Day 9", ideal: 4, actual: 4 },
    { day: "Day 10", ideal: 2, actual: 2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your workspace
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Across {projects.length} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedIssues}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressIssues}</div>
            <p className="text-xs text-muted-foreground">
              Active work items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
            <CardDescription>
              Priority breakdown across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Velocity</CardTitle>
            <CardDescription>
              Issues completed vs created (last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Burndown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sprint Burndown</CardTitle>
            <CardDescription>
              Ideal vs actual progress over sprint duration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Project Performance</CardTitle>
          <CardDescription>
            Completion rates and progress across all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => {
              const projectIssues = allIssues.filter(i => i.projectId === project.id);
              const completed = projectIssues.filter(i => i.status === "DONE").length;
              const total = projectIssues.length;
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{project.name}</span>
                      <Badge variant="outline">{project.key}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {completed}/{total} issues
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{progress}% complete</span>
                    {progress >= 80 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : progress >= 50 ? (
                      <TrendingUp className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

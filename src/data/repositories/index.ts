import { IIssuesRepo, issuesRepo } from "./issues.repo";
import { IProjectsRepo, projectsRepo } from "./projects.repo";
import { IWorkspacesRepo, workspacesRepo } from "./workspaces.repo";
import { IMembersRepo, membersRepo } from "./members.repo";

export interface DataContainer {
  workspaces: IWorkspacesRepo;
  projects: IProjectsRepo;
  issues: IIssuesRepo;
  members: IMembersRepo;
}

export const dataContainer: DataContainer = {
  workspaces: workspacesRepo,
  projects: projectsRepo,
  issues: issuesRepo,
  members: membersRepo,
};

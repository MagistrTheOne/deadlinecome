import { Issue } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypeStyles, PriorityStyles, StatusColors, getLabelColor } from "@/lib/types";
import { Calendar, MessageCircle, Paperclip } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
  isDragging?: boolean;
}

export function IssueCard({ issue, onClick, className, isSelected = false, isDragging = false }: IssueCardProps) {
  const priorityStyle = PriorityStyles[issue.priority];
  const typeStyle = TypeStyles[issue.type];

  return (
    <div
      className={`bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      } ${isDragging ? "opacity-50 rotate-2" : ""} ${
        priorityStyle.borderColor
      } border-l-4 ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Issue ${issue.key}: ${issue.title} - Priority ${issue.priority}, Type ${issue.type}`}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{issue.key}</span>
          <Badge
            variant="secondary"
            className={`${typeStyle.color} ${typeStyle.bgColor} ${typeStyle.borderColor} border font-medium`}
          >
            <span className="mr-1">{typeStyle.icon}</span>
            {issue.type}
          </Badge>
          <Badge
            variant="outline"
            className={`${priorityStyle.color} ${priorityStyle.bgColor} ${priorityStyle.borderColor} border font-medium`}
          >
            <span className="mr-1">{priorityStyle.icon}</span>
            {issue.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {issue.storyPoints && `${issue.storyPoints} pts`}
          </span>
        </div>
      </div>

      <h3 className="font-medium mb-2 line-clamp-2">{issue.title}</h3>

      {issue.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {issue.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {issue.assigneeId && (
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {issue.assigneeId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {issue.labels.length > 0 && (
            <div className="flex gap-1">
              {issue.labels.slice(0, 2).map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className={`text-xs font-medium border ${getLabelColor(label)}`}
                >
                  {label}
                </Badge>
              ))}
              {issue.labels.length > 2 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                  +{issue.labels.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(issue.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard home route (`/dashboard`) — the main workspace overview composed of dashboard widgets.
import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { ExperimentTimeline } from "@/components/dashboard/experiment-timeline";
import { ExploreTemplates } from "@/components/dashboard/explore-templates";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { RecentProjects } from "@/components/dashboard/recent-projects";

// Renders the dashboard overview: greeting, a two-column grid of projects/timeline + activity panel, and template exploration.
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-350 px-6 py-8">
      <GreetingHeader name="Anurag" />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <RecentProjects />
          <ExperimentTimeline />
        </div>

        <ActivityPanel />
      </div>

      <div className="mt-10">
        <ExploreTemplates />
      </div>
    </div>
  );
}

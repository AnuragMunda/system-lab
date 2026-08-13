import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { ExperimentTimeline } from "@/components/dashboard/experiment-timeline";
import { ExploreTemplates } from "@/components/dashboard/explore-templates";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { RecentProjects } from "@/components/dashboard/recent-projects";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
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

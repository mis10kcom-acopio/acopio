import { fetchRecentActivity } from "@/lib/activity-ticker";
import { ActivityTicker } from "@/components/ActivityTicker";

export async function ActivityTickerShell() {
  const items = await fetchRecentActivity();
  return <ActivityTicker items={items} />;
}

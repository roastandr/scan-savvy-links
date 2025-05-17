
// This is now a barrel file that re-exports from the refactored module
import { useDashboardData, ChartDataPoint } from "./dashboard/useDashboardData";
import { StatItem } from "./dashboard/statsUtils";

export type { StatItem, ChartDataPoint };
export { useDashboardData };

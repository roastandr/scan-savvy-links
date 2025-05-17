
// This is a barrel file that re-exports from the refactored module
import { useDashboardData } from "./dashboard/useDashboardData";
import { StatItem } from "./dashboard/statsUtils";
import { ChartDataPoint } from "./dashboard/useDashboardData";

export type { StatItem, ChartDataPoint };
export { useDashboardData };

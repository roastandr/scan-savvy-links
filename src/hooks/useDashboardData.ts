
// This is now a barrel file that re-exports from the refactored module
import { useDashboardData } from "./dashboard/useDashboardData";
export type { StatItem, ChartDataPoint } from "./dashboard/useDashboardData";

export { useDashboardData };

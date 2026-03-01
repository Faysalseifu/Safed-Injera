import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { DashboardBranch } from './DashboardBranch';

/**
 * Dashboard wrapper that routes based on user role:
 * - sub_admin → DashboardBranch (their branch only)
 * - admin/staff → Original Dashboard (with statistics, charts, etc.)
 * 
 * Branch details are accessed via /branch-dashboard route (not through main dashboard)
 */
export const DashboardWrapper = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  // Sub-admin: Always show their branch dashboard
  if (userRole === 'sub_admin') {
    return <DashboardBranch />;
  }

  // Admin/Staff: Show original dashboard with statistics
  return <Dashboard />;
};

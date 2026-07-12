const DASHBOARD_PATHS = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  user: '/user/dashboard',
}

export function getRoleDashboard(role) {
  return DASHBOARD_PATHS[role] || '/unauthorized'
}

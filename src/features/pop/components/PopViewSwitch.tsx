import { NavLink, useLocation } from 'react-router-dom'

export function PopViewSwitch() {
  const { pathname } = useLocation()
  const homeActive =
    pathname === '/pop' || pathname === '/pop/home' || pathname === '/pop/enroll'
  const dashboardActive = pathname.startsWith('/pop/dashboard')

  return (
    <nav className="mt-5 flex gap-6" aria-label="POP views">
      <NavLink to="/pop" end className={() => tabClass(homeActive)}>
        Home
      </NavLink>
      <NavLink to="/pop/dashboard" className={() => tabClass(dashboardActive)}>
        Dashboard
      </NavLink>
    </nav>
  )
}

function tabClass(isActive: boolean) {
  return `-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
    isActive
      ? 'border-slate-900 font-semibold text-slate-900'
      : 'border-transparent font-medium text-slate-500 hover:text-slate-700'
  }`
}

import { NavLink } from 'react-router-dom'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  DollarSign,
  FileText,
  Menu,
  Hammer,
  Building2,
  Gem,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/warehouse', icon: Building2, label: 'Warehouse' },
  { to: '/mto', icon: Hammer, label: 'MTO' },
  { to: '/pop', icon: Gem, label: 'POP' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

export function Sidebar() {
  return (
    <aside className="flex w-20 shrink-0 flex-col items-center border-r border-slate-200 bg-white">
      <div className="flex w-full items-center justify-center border-b border-slate-200 px-6 py-6">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
          aria-label="Menu"
        >
          <Menu className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2 px-3 py-3">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex size-11 items-center justify-center rounded-[10px] transition-colors ${
                isActive
                  ? 'border border-slate-200 bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
            title={label}
          >
            <Icon className="size-5" />
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-center px-4 py-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-sm font-semibold text-white">
          A
        </div>
      </div>
    </aside>
  )
}

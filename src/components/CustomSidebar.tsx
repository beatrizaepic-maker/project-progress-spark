import Home from 'lucide-react/dist/esm/icons/home';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import ListTodo from 'lucide-react/dist/esm/icons/list-todo';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import User from 'lucide-react/dist/esm/icons/user';
import FileEdit from 'lucide-react/dist/esm/icons/file-edit';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Tasks', url: '/tasks', icon: ListTodo },
  { title: 'Ranking', url: '/ranking', icon: Trophy },
];

const userItems = [
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Editor', url: '/editor', icon: FileEdit },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminItems = [
  { title: 'Control', url: '/control', icon: Shield },
];

export function CustomSidebar() {
  const { user } = useAuth();
  // open: expanded state. Default to true to match current UI expanded look.
  const [open, setOpen] = useState(true);

  // Normaliza papel do usuário
  const normalizedRole = String(user?.role || '').toLowerCase() as 'admin' | 'dev' | 'user' | 'manager' | '';
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'dev';

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const handleFocus = () => setOpen(true);
  const handleBlur = () => setOpen(false);

  const toggle = () => setOpen((v) => !v);
  const collapsed = !open;

  return (
    <aside
      className={`app-sidebar ${!open ? 'collapsed' : ''} flex-shrink-0 transition-all duration-300 ease-in-out`}
      style={{ width: open ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)' }}
      role="navigation"
      aria-label="Menu principal"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="sidebar-brand">
        <img src="/LOGOEPIC.png" alt="EPIC" width={36} height={36} />
        <span className="sidebar-label">EPIC Space</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul>
          {mainItems.map((item) => (
            <li key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink to={item.url} end>
                    {({ isActive }) => (
                      <button
                        className="sidebar-item"
                        aria-current={isActive ? 'true' : undefined}
                        aria-label={item.title}
                        title={item.title}
                      >
                        <item.icon className="icon" />
                        <span className="sidebar-label">{item.title}</span>
                      </button>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
        </ul>

        <div style={{ height: 16 }} />

        <ul>
          {userItems.map((item) => (
            <li key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink to={item.url}>
                    {({ isActive }) => (
                      <button className="sidebar-item" aria-current={isActive ? 'true' : undefined} aria-label={item.title}>
                        <item.icon className="icon" />
                        <span className="sidebar-label">{item.title}</span>
                      </button>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
              </Tooltip>
            </li>
          ))}
        </ul>

        {/* Seção de Admin (visível apenas para admins) */}
        {isAdmin && (
          <>
            <div style={{ height: 16 }} />
            <ul>
              {adminItems.map((item) => (
                <li key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink to={item.url}>
                        {({ isActive }) => (
                          <button className="sidebar-item" aria-current={isActive ? 'true' : undefined} aria-label={item.title}>
                            <item.icon className="icon" />
                            <span className="sidebar-label">{item.title}</span>
                          </button>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

  <div className="sidebar-footer">
        <div className="profile">
          <Avatar>
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="sidebar-label">
            <div className="name">{user?.name || user?.email}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>

        <button
          className="sidebar-toggle"
          aria-pressed={!open}
          aria-expanded={open}
          onClick={toggle}
          aria-label="Alternar menu"
        >
          <svg className={`chev ${!open ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </aside>
  );
}

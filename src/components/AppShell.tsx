import React, { useEffect } from 'react';
import { LazyMotion, domMax, m, AnimatePresence, MotionConfig } from 'motion/react';
import { LogOut, Scale, LucideIcon } from 'lucide-react';
import '../app.css';

export interface AppShellNavItem<K extends string> {
  key: K;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  count?: number;
  countTone?: 'neutral' | 'alert' | 'lime';
  dot?: 'lime' | 'orange';
}

interface AppShellProps<K extends string> {
  spaceLabel: string;
  contextCard?: { title: string; meta?: React.ReactNode; badge?: React.ReactNode };
  navItems: AppShellNavItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
  user: { initials: string; name: string; role: string };
  onLogout?: () => void;
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export const EASE = [0.22, 1, 0.36, 1] as const;

export function AppShell<K extends string>({
  spaceLabel,
  contextCard,
  navItems,
  activeKey,
  onSelect,
  user,
  onLogout,
  banner,
  children
}: AppShellProps<K>) {
  const active = navItems.find(i => i.key === activeKey);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeKey]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <div className="ax ax-shell">
          {/* Barre latérale (bureau) */}
          <aside className="ax-sidebar">
            <div className="ax-brand">
              <span className="ax-brand-mark"><Scale size={17} /></span>
              <div>
                <div className="ax-brand-name">AssoExpert</div>
                <div className="ax-brand-ctx">{spaceLabel}</div>
              </div>
            </div>

            {contextCard && (
              <div className="ax-context">
                <div className="ax-row-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                  <div className="ax-context-title">{contextCard.title}</div>
                  {contextCard.badge}
                </div>
                {contextCard.meta && <div className="ax-context-meta">{contextCard.meta}</div>}
              </div>
            )}

            <div className="ax-nav-label">Menu</div>
            <nav className="ax-nav" aria-label="Navigation principale">
              {navItems.map(item => {
                const isActive = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    className={`ax-nav-item${isActive ? ' is-active' : ''}`}
                    onClick={() => onSelect(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <m.span
                        layoutId="ax-nav-pill"
                        className="ax-nav-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <Icon size={18} />
                    <span className="ax-nav-text">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={`ax-count${item.countTone === 'alert' ? ' ax-count-alert' : item.countTone === 'lime' ? ' ax-count-lime' : ''}`}>
                        {item.count}
                      </span>
                    )}
                    {item.dot && <span className="ax-dot" style={{ color: item.dot === 'lime' ? '#8BD93A' : 'var(--color-orange)' }} />}
                  </button>
                );
              })}
            </nav>

            <div className="ax-sidebar-foot">
              <span className="ax-avatar ax-avatar-sm">{user.initials}</span>
              <div className="ax-user">
                <div className="ax-user-name">{user.name}</div>
                <div className="ax-user-role">{user.role}</div>
              </div>
              {onLogout && (
                <button className="ax-btn ax-btn-ghost ax-btn-icon" onClick={onLogout} title="Se déconnecter" aria-label="Se déconnecter">
                  <LogOut size={17} />
                </button>
              )}
            </div>
          </aside>

          <div className="ax-main">
            {/* Barre supérieure (mobile) */}
            <header className="ax-topbar">
              <span className="ax-brand-mark"><Scale size={16} /></span>
              <span className="ax-topbar-title">{active?.label}</span>
              {onLogout && (
                <button className="ax-btn ax-btn-ghost ax-btn-icon" onClick={onLogout} aria-label="Se déconnecter">
                  <LogOut size={18} />
                </button>
              )}
            </header>

            <main className="ax-content">
              {banner}
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={activeKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  {children}
                </m.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Navigation basse (mobile) */}
          <nav className="ax-bottom-nav" aria-label="Navigation mobile">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.key === activeKey;
              const showDot = item.dot || (item.countTone === 'alert' && (item.count ?? 0) > 0);
              return (
                <button
                  key={item.key}
                  className={`ax-bottom-item${isActive ? ' is-active' : ''}`}
                  onClick={() => onSelect(item.key)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={21} />
                  <span>{item.shortLabel}</span>
                  {showDot && <span className={`ax-bottom-dot${item.dot === 'lime' ? ' ax-bottom-dot-lime' : ''}`} />}
                </button>
              );
            })}
          </nav>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}

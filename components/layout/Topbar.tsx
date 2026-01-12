'use client';

import { ReactNode } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  actionPosition?: 'left' | 'right';
  greeting?: boolean;
}

export function Topbar({ title, subtitle, action, actionPosition = 'right', greeting }: TopbarProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="border-b bg-white">
      <div className="px-4 lg:px-6 py-4 lg:py-6">
        {greeting && (
          <p className="text-sm text-muted mb-1">{getGreeting()},</p>
        )}
        {action && actionPosition === 'left' ? (
          <div className="flex items-start gap-4">
            <div className="shrink-0">{action}</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">{title}</h1>
              {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">{title}</h1>
              {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

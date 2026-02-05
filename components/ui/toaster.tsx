'use client';

import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import type { ToasterToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/store';
import { deriveNotificationRoute } from '@/lib/notificationRoute';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const router = useRouter();
  const role = useAppSelector((state) => state.auth.user?.role);
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function (toastData: ToasterToast) {
        const { id, title, description, action, meta, route, ...props } = toastData;
        const { onClick: propsOnClick, ...toastProps } = props;
        const notificationRoute = deriveNotificationRoute({
          role,
          meta,
          title,
          description,
          explicitRoute: route,
        });

        const handleClick = (event: MouseEvent<HTMLLIElement>) => {
          propsOnClick?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as Element;
          if (target.closest('[data-toast-ignore]')) return;
          if (!notificationRoute) return;
          dismiss(id);
          router.push(notificationRoute);
        };

        return (
          <Toast key={id} {...toastProps} onClick={handleClick}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action && (
              <div data-toast-ignore="" onClick={(event) => event.stopPropagation()}>
                {action}
              </div>
            )}
            <ToastClose
              data-toast-ignore=""
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

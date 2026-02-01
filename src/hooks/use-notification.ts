import { useNotification } from '@/context/NotificationContext';

export function useToast() {
  const { notify } = useNotification();

  return {
    success: (title: string, message?: string) => 
      notify('success', title, message, 3500),
    error: (title: string, message?: string) => 
      notify('error', title, message, 4000),
    warning: (title: string, message?: string) => 
      notify('warning', title, message, 3500),
    info: (title: string, message?: string) => 
      notify('info', title, message, 3500),
  };
}

import React from 'react';
import { useNotification, Notification, NotificationType } from '@/context/NotificationContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const notificationStyles = {
  success: {
    gradient: 'from-green-500 to-emerald-600',
    icon: 'text-white',
    bg: 'bg-gradient-to-r',
  },
  error: {
    gradient: 'from-red-500 to-rose-600',
    icon: 'text-white',
    bg: 'bg-gradient-to-r',
  },
  warning: {
    gradient: 'from-yellow-500 to-orange-600',
    icon: 'text-white',
    bg: 'bg-gradient-to-r',
  },
  info: {
    gradient: 'from-blue-500 to-indigo-600',
    icon: 'text-white',
    bg: 'bg-gradient-to-r',
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotification();
  const style = notificationStyles[notification.type];
  const Icon = notificationIcons[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className="w-full max-w-md"
    >
      <div className={`${style.bg} ${style.gradient} rounded-xl p-4 text-white shadow-xl backdrop-blur-sm border border-white/20 flex items-start gap-3`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{notification.title}</h3>
          {notification.message && (
            <p className="text-xs text-white/90 mt-1">{notification.message}</p>
          )}
        </div>

        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-6 right-6 left-6 sm:left-auto z-50 flex flex-col gap-3 pointer-events-none">
      <motion.div layout className="space-y-3">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { AuditLog } from '@repo/shared';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionHistory() {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await apiClient.get<{ logs: AuditLog[]; total: number }>(
        '/account/security/logs'
      );
      setLogs(response.data!.logs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load session history',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      case 'profile_update':
        return 'Updated profile';
      case 'password_change':
        return 'Changed password';
      default:
        return action;
    }
  };

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return { icon: '📱', device: 'iOS Device' };
    } else if (userAgent.includes('Android')) {
      return { icon: '📱', device: 'Android Device' };
    } else if (userAgent.includes('Macintosh')) {
      return { icon: '💻', device: 'Mac' };
    } else if (userAgent.includes('Windows')) {
      return { icon: '💻', device: 'Windows PC' };
    } else {
      return { icon: '🖥️', device: 'Unknown Device' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No session history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const deviceInfo = getDeviceInfo(log.userAgent);
        return (
          <div
            key={log.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="text-2xl">{deviceInfo.icon}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {getActionLabel(log.action)}
                  </p>
                  <p className="text-sm text-gray-600">{deviceInfo.device}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                IP Address: {log.ipAddress}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

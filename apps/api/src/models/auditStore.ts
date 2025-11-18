import { AuditLog } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';

class AuditStore {
  private logs: Map<string, AuditLog> = new Map();
  private userLogIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.seedLogs();
  }

  private seedLogs() {
    const now = new Date();
    const sampleLogs: AuditLog[] = [
      {
        id: uuidv4(),
        userId: 'user-sample',
        action: 'login',
        ipAddress: '192.168.1.1',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'user-sample',
        action: 'profile_update',
        ipAddress: '192.168.1.1',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(now.getTime() - 86400000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'user-sample',
        action: 'login',
        ipAddress: '10.0.0.5',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: new Date(now.getTime() - 172800000).toISOString(),
      },
    ];

    sampleLogs.forEach((log) => {
      this.logs.set(log.id, log);
      const userLogs = this.userLogIndex.get(log.userId) || new Set();
      userLogs.add(log.id);
      this.userLogIndex.set(log.userId, userLogs);
    });
  }

  async createLog(
    userId: string,
    action: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuidv4(),
      userId,
      action,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    this.logs.set(log.id, log);

    const userLogs = this.userLogIndex.get(userId) || new Set();
    userLogs.add(log.id);
    this.userLogIndex.set(userId, userLogs);

    return log;
  }

  async getUserLogs(
    userId: string,
    limit = 20
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const logIds = this.userLogIndex.get(userId) || new Set();
    const allLogs = Array.from(logIds)
      .map((id) => this.logs.get(id))
      .filter((log): log is AuditLog => log !== undefined)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    const total = allLogs.length;
    const limitedLogs = allLogs.slice(0, limit);

    return { logs: limitedLogs, total };
  }
}

export const auditStore = new AuditStore();

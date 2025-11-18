import { AuthUser, UserRole } from '@repo/shared';

interface StoredUser extends AuthUser {
  passwordHash: string;
}

class UserStore {
  private users: Map<string, StoredUser> = new Map();
  private emailIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async create(
    email: string,
    passwordHash: string,
    name: string,
    role: UserRole = UserRole.CUSTOMER
  ): Promise<AuthUser> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const user: StoredUser = {
      id,
      email: email.toLowerCase(),
      name,
      role,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    this.emailIndex.set(email.toLowerCase(), id);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async emailExists(email: string): Promise<boolean> {
    return this.emailIndex.has(email.toLowerCase());
  }
}

export const userStore = new UserStore();

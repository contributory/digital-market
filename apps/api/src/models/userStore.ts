import { AuthUser, UserRole, UserProfile } from '@repo/shared';

interface StoredUser extends AuthUser {
  passwordHash: string;
  phone?: string;
  marketingEmails: boolean;
  marketingSms: boolean;
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
      phone: undefined,
      marketingEmails: false,
      marketingSms: false,
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

  async getProfile(id: string): Promise<UserProfile | null> {
    const user = this.users.get(id);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      marketingEmails: user.marketingEmails,
      marketingSms: user.marketingSms,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    id: string,
    updates: {
      name?: string;
      phone?: string;
      marketingEmails?: boolean;
      marketingSms?: boolean;
    }
  ): Promise<UserProfile | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return this.getProfile(id);
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    this.users.set(id, user);
    return true;
  }
}

export const userStore = new UserStore();

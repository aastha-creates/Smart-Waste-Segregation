import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

class UserStore {
  private users: UserRecord[] = [];
  private initialized = false;

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  public init() {
    if (this.initialized) return;
    this.ensureDirectory();

    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          this.initialized = true;
          return;
        }
      } catch (err) {
        console.error('[UserStore] Error loading users, resetting:', err);
      }
    }

    // Default Seed Users
    const demoSalt = crypto.randomBytes(16).toString('hex');
    const adminSalt = crypto.randomBytes(16).toString('hex');

    this.users = [
      {
        id: 'user-demo-1',
        name: 'Alex Green',
        email: 'user@smartwaste.eco',
        salt: demoSalt,
        passwordHash: this.hashPassword('user123', demoSalt),
        role: 'user',
        created_at: '2026-08-01T10:00:00.000Z'
      },
      {
        id: 'admin-1',
        name: 'Sustainability Officer',
        email: 'admin@smartwaste.eco',
        salt: adminSalt,
        passwordHash: this.hashPassword('admin123', adminSalt),
        role: 'admin',
        created_at: '2026-07-15T08:30:00.000Z'
      }
    ];

    this.persist();
    this.initialized = true;
  }

  private persist() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UserStore] Error persisting users:', err);
    }
  }

  public signUp(name: string, email: string, password: string): { user: UserPublicProfile; token: string } {
    this.init();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters long.');
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const existing = this.users.find(u => u.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    const newUser: UserRecord = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      salt,
      passwordHash,
      role: 'user',
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.persist();

    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      },
      token
    };
  }

  public login(email: string, password: string): { user: UserPublicProfile; token: string } {
    this.init();
    const cleanEmail = email.trim().toLowerCase();

    const user = this.users.find(u => u.email === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const calculatedHash = this.hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    };
  }

  public verifyToken(token: string): UserPublicProfile | null {
    this.init();
    try {
      if (!token || !token.startsWith('sw_token_')) return null;
      const parts = token.split('_');
      // Format: sw_token_<sig>_<encodedId>
      if (parts.length < 4) return null;
      const userId = Buffer.from(parts[3], 'base64').toString('utf-8');
      const user = this.users.find(u => u.id === userId);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      };
    } catch {
      return null;
    }
  }

  public getUserById(id: string): UserPublicProfile | null {
    this.init();
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };
  }

  public getAllUsersCount(): number {
    this.init();
    return this.users.length;
  }

  private generateToken(user: UserRecord): string {
    const encodedId = Buffer.from(user.id).toString('base64');
    const sig = crypto.createHmac('sha256', 'smartwaste-app-secret-2026').update(user.id).digest('hex').slice(0, 16);
    return `sw_token_${sig}_${encodedId}`;
  }
}

export const userStore = new UserStore();

import { pool } from '../config/db';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
}

export const findUserByUsernameOrEmail = async (identifier: string): Promise<UserRecord | null> => {
  const { rows } = await pool.query<UserRecord>(
    `SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1`,
    [identifier]
  );
  return rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<Omit<UserRecord, 'password'> | null> => {
  const { rows } = await pool.query<UserRecord>(
    `SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const createUser = async (user: CreateUserInput): Promise<UserRecord> => {
  const { rows } = await pool.query<UserRecord>(
    `INSERT INTO users (id, username, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user.id, user.username, user.email, user.password, user.role]
  );
  return rows[0];
};

export const countUsers = async (): Promise<number> => {
  const { rows } = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM users`
  );
  return rows[0]?.count ?? 0;
};

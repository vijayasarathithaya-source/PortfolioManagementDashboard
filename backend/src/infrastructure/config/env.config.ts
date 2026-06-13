export const EnvConfig = {
  get PORT(): number {
    return Number(process.env.PORT) || 3000;
  },

  get DB_PATH(): string {
    return process.env.DB_PATH || './database.sqlite';
  },

  get JWT_PRIVATE_KEY_PATH(): string {
    const path = process.env.JWT_PRIVATE_KEY_PATH;
    if (!path) {
      throw new Error('JWT_PRIVATE_KEY_PATH environment variable is not defined');
    }
    return path;
  },

  get JWT_PUBLIC_KEY_PATH(): string {
    const path = process.env.JWT_PUBLIC_KEY_PATH;
    if (!path) {
      throw new Error('JWT_PUBLIC_KEY_PATH environment variable is not defined');
    }
    return path;
  }
};

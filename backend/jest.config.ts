import fs from 'fs';
import path from 'path';
import type { Config } from 'jest';

try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1]?.trim();
        const value = match[2]?.trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (err) {
  // Ignore if .env file is missing
}

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config;

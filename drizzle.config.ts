import type { Config } from 'drizzle-kit'

export default {
    schema: './lib/db.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: process.env.POSTGRES_URL
        ? { connectionString: process.env.POSTGRES_URL }
        : {
              host: process.env.POSTGRES_HOST || '',
              user: process.env.POSTGRES_USER || '',
              password: process.env.POSTGRES_PASSWORD || '',
              database: process.env.POSTGRES_DATABASE || '',
          },
} satisfies Config

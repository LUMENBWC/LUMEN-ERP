import path from 'node:path';
import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Next.js only auto-loads .env files from this app's own directory. The
// monorepo keeps a single .env at the repo root (see apps/api's
// prisma.config.ts / app.module.ts for the same pattern), so load it
// explicitly before NEXT_PUBLIC_* vars get inlined into the build.
config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {/* config options here */};

export default nextConfig;

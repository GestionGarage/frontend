import createNextIntlPlugin from 'next-intl/plugin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typedRoutes: true,
  webpack(config) {
    config.resolve.alias['@gestion-garage/shared-validators'] = path.resolve(
      __dirname,
      'lib/validators/index.ts',
    );
    return config;
  },
};

export default withNextIntl(nextConfig);

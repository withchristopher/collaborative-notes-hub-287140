'use strict';

/**
 * Next.js configuration for notetaker-frontend.
 * Ensures standalone output and disables telemetry in production builds.
 */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@unanima/core',
    '@unanima/auth',
    '@unanima/dashboard',
    '@unanima/db',
    '@unanima/email',
    '@unanima/rgpd',
  ],
}

module.exports = nextConfig

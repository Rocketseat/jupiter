const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'github.com' }
    ]
  },

  /**
   * 
   * @param {import('webpack').Configuration} config
   */
  webpack: (config) => {

    /**
     * Suppress warning about not found modules
     */
    config.resolve.fallback = {
      'aws-crt': false,
      encoding: false,
      '@aws-sdk/signature-v4-crt': false,
      'bufferutil': false,
      'utf-8-validate': false,
    }

    /**
     * Suppress warning about `createFFMpeg`
     */
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: /Critical/,
      }),
    )

    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

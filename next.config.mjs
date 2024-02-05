import FilterWarningsPlugin from 'webpack-filter-warnings-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'github.com' },
    ],
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
      bufferutil: false,
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
}

export default nextConfig

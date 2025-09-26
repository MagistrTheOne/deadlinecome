import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  /* config options here */
  serverExternalPackages: ['ws'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ws');
    }
    return config;
  }
};

export default bundleAnalyzer(nextConfig);

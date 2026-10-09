module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 's3-us-west-2.amazonaws.com' },
    ],
  },
  // 도트 이펙트 작업대 (public/fx/index.html)
  async rewrites() {
    return [{ source: '/fx', destination: '/fx/index.html' }]
  },
}

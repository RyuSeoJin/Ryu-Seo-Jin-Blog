module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // 도트 이펙트 작업대 (public/fx/index.html)
      { source: '/fx', destination: '/fx/index.html' },
      // 웹 관리자 화면 (public/admin/index.html)
      { source: '/admin', destination: '/admin/index.html' },
      // RSS (빌드 전에 scripts/build-feed.mjs 가 public/feed.xml 을 만듭니다)
      { source: '/feed', destination: '/feed.xml' },
    ]
  },
}

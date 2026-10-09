module.exports = {
  reactStrictMode: true,
  // 댓글 API 가 "실제 있는 글인지" 확인할 때 글 파일 목록을 읽으므로 서버 함수에 함께 담습니다
  outputFileTracingIncludes: {
    "/api/comments": ["./content/posts/*.md"],
    "/api/comments/react": ["./content/posts/*.md"],
  },
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

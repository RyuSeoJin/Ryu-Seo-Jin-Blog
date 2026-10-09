/** 방명록 포스트잇 색·기울기 (메인 방명록 띠와 방명록 페이지가 함께 씁니다) */

// 클래식 포스트잇 색 (채도를 한 단계 낮춰 사이트 색과 부딪히지 않게)
export const POSTIT_COLORS = ["#fff4b8", "#d9f5e0", "#ffdbe6", "#dbe8ff", "#ffe6c7"]
export const POSTIT_TILTS = [-2, 1.5, -1, 2, -1.5]

export const postitStyle = (i: number, owner = false) =>
  owner
    ? { background: "#ffffff", transform: "rotate(-1deg)" }
    : { background: POSTIT_COLORS[i % POSTIT_COLORS.length], transform: `rotate(${POSTIT_TILTS[i % POSTIT_TILTS.length]}deg)` }

/**
 * 태그 형식: "순서::분류::이름" (예: "4::WIKI::용어")
 * 형식이 아니면 "기타" 분류에 이름 그대로 둡니다.
 */
export function parseTag(tag: string): { order: number; group: string; name: string } {
  const parts = tag.split("::").map((s) => s.trim())
  if (parts.length === 3 && /^\d+$/.test(parts[0])) {
    return { order: Number(parts[0]), group: parts[1], name: parts[2] }
  }
  if (parts.length === 2) return { order: 50, group: parts[0], name: parts[1] }
  return { order: 999, group: "기타", name: tag }
}

/** 화면에 보여줄 짧은 이름: "WIKI · 용어" */
export function tagLabel(tag: string): string {
  const t = parseTag(tag)
  return t.group === "기타" ? t.name : `${t.group} · ${t.name}`
}

/** 카테고리 "📔 위키" → { icon: "📔", text: "위키" } */
export function splitCategory(category: string): { icon: string; text: string } {
  const m = category.match(/^(\p{Extended_Pictographic}(?:️)?)\s*(.*)$/u)
  return m ? { icon: m[1], text: m[2] } : { icon: "", text: category }
}

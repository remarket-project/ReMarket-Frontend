const PREFIXES = [
  "Thành phố ",
  "Tỉnh ",
  "Quận ",
  "Huyện ",
  "Phường ",
  "Xã ",
  "Thị trấn ",
  "Thị xã ",
]

export function normalizeLocation(s: string | undefined | null): string {
  if (!s) return ""
  let name = s.toLowerCase().trim().replace(/\s+/g, " ")
  for (const prefix of PREFIXES) {
    if (name.startsWith(prefix.toLowerCase().trim())) {
      name = name.slice(prefix.toLowerCase().trim().length).trim()
      break
    }
  }
  return name
}

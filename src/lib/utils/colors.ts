// 地域別カラーマッピング（シニア向けカラフル配色）
export const REGION_COLORS: Record<string, { bg: string; text: string }> = {
  '飯田市': { bg: '#DC143C', text: '#FFFFFF' },     // Crimson
  '南信州': { bg: '#FFD700', text: '#2D3748' },     // Gold
  '高森町': { bg: '#A4D65E', text: '#2D3748' },     // Lime
  '松川町': { bg: '#40E0D0', text: '#2D3748' },     // Turquoise
  '阿智村': { bg: '#B19CD9', text: '#FFFFFF' },     // Lavender
  '平谷村': { bg: '#FFA07A', text: '#2D3748' },     // Peach
  '根羽村': { bg: '#D2691E', text: '#FFFFFF' },     // Terracotta
  '下条村': { bg: '#FA8072', text: '#2D3748' },     // Salmon
  '売木村': { bg: '#FF8C42', text: '#FFFFFF' },     // Tangerine
  '天龍村': { bg: '#20B2AA', text: '#FFFFFF' },     // Teal
  '泰阜村': { bg: '#98D8C8', text: '#2D3748' },     // Mint
  '喬木村': { bg: '#F687B3', text: '#2D3748' },     // Rose
  '豊丘村': { bg: '#32CD32', text: '#FFFFFF' },     // Lime Green
  '大鹿村': { bg: '#87CEEB', text: '#2D3748' },     // Sky Blue
}

// デフォルトカラー
const DEFAULT_COLOR = { bg: '#64748b', text: '#FFFFFF' }

/**
 * 地域名から対応するカラーを取得
 */
export function getRegionColor(region: string | null): { bg: string; text: string } {
  if (!region) return DEFAULT_COLOR
  return REGION_COLORS[region] || DEFAULT_COLOR
}

/**
 * 地域名から背景色のみを取得
 */
export function getRegionBgColor(region: string | null): string {
  return getRegionColor(region).bg
}

/**
 * 地域名からテキスト色のみを取得
 */
export function getRegionTextColor(region: string | null): string {
  return getRegionColor(region).text
}

/**
 * Hex色をRGBAに変換（透明度付き）
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 地域カラーの薄いバージョン（カード背景用）
 */
export function getRegionLightBg(region: string | null): string {
  const regionColor = getRegionColor(region)
  return hexToRgba(regionColor.bg, 0.12) // 透明度12%
}

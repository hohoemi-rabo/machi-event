/**
 * 様々な日付形式を YYYY-MM-DD 形式に変換
 */
export function parseDateString(dateText: string): string | null {
  if (!dateText) {
    return null
  }

  const text = dateText.trim()

  // パターン1: "2025年11月7日"
  const pattern1 = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (pattern1) {
    const year = pattern1[1]
    const month = pattern1[2].padStart(2, '0')
    const day = pattern1[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // パターン2: "11月7日" または "11/7"
  const pattern2 = text.match(/(\d{1,2})[月/](\d{1,2})/)
  if (pattern2) {
    const currentYear = new Date().getFullYear()
    const month = pattern2[1].padStart(2, '0')
    const day = pattern2[2].padStart(2, '0')

    // 月が現在より前の場合、来年とみなす
    const currentMonth = new Date().getMonth() + 1
    const eventMonth = parseInt(month)
    const year = eventMonth < currentMonth ? currentYear + 1 : currentYear

    return `${year}-${month}-${day}`
  }

  // パターン3: "令和7年11月7日"
  const pattern3 = text.match(/令和(\d+)年(\d{1,2})月(\d{1,2})日/)
  if (pattern3) {
    const reiwaYear = parseInt(pattern3[1])
    const year = 2018 + reiwaYear // 令和元年は2019年
    const month = pattern3[2].padStart(2, '0')
    const day = pattern3[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // パターン4: "2025-11-07" (既に正しい形式)
  const pattern4 = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (pattern4) {
    return text
  }

  // パターン5: "2025/11/07"
  const pattern5 = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (pattern5) {
    const year = pattern5[1]
    const month = pattern5[2].padStart(2, '0')
    const day = pattern5[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // パターン6: "11.7" (ドット区切り)
  const pattern6 = text.match(/(\d{1,2})\.(\d{1,2})/)
  if (pattern6) {
    const currentYear = new Date().getFullYear()
    const month = pattern6[1].padStart(2, '0')
    const day = pattern6[2].padStart(2, '0')

    const currentMonth = new Date().getMonth() + 1
    const eventMonth = parseInt(month)
    const year = eventMonth < currentMonth ? currentYear + 1 : currentYear

    return `${year}-${month}-${day}`
  }

  return null
}

/**
 * 時刻情報を抽出
 * 例: "10:00-16:00" → "10:00-16:00"
 */
export function parseTimeString(timeText: string): string | null {
  if (!timeText) {
    return null
  }

  const text = timeText.trim()

  // パターン1: "10:00-16:00" or "10:00～16:00"
  const pattern1 = text.match(/(\d{1,2}:\d{2})[～~\-−](\d{1,2}:\d{2})/)
  if (pattern1) {
    return `${pattern1[1]}-${pattern1[2]}`
  }

  // パターン2: "10:00" (単一時刻)
  const pattern2 = text.match(/(\d{1,2}:\d{2})/)
  if (pattern2) {
    return pattern2[1]
  }

  // パターン3: "10時00分" 形式
  const pattern3 = text.match(/(\d{1,2})時(\d{2})分/)
  if (pattern3) {
    const hour = pattern3[1].padStart(2, '0')
    const minute = pattern3[2]
    return `${hour}:${minute}`
  }

  return null
}

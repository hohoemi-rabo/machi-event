/**
 * 日付が妥当かバリデーション
 */
function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  // JavaScriptのDateオブジェクトで妥当性チェック
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day
}

/**
 * 様々な日付形式を YYYY-MM-DD 形式に変換
 */
export function parseDateString(dateText: string): string | null {
  if (!dateText) {
    return null
  }

  const text = dateText.trim()

  // === 年付き日付形式（優先）===

  // パターン1: "2025年11月7日"
  const pattern1 = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (pattern1) {
    const year = parseInt(pattern1[1])
    const month = parseInt(pattern1[2])
    const day = parseInt(pattern1[3])

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // パターン2: "令和7年11月7日"
  const pattern2 = text.match(/令和(\d+)年(\d{1,2})月(\d{1,2})日/)
  if (pattern2) {
    const reiwaYear = parseInt(pattern2[1])
    const year = 2018 + reiwaYear // 令和元年は2019年
    const month = parseInt(pattern2[2])
    const day = parseInt(pattern2[3])

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // パターン3: "2025-11-07" (既に正しい形式)
  const pattern3 = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (pattern3) {
    const year = parseInt(pattern3[1])
    const month = parseInt(pattern3[2])
    const day = parseInt(pattern3[3])

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // パターン4: "2025/11/07"
  const pattern4 = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (pattern4) {
    const year = parseInt(pattern4[1])
    const month = parseInt(pattern4[2])
    const day = parseInt(pattern4[3])

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // パターン5: "2025.08.22" (YYYY.MM.DD ドット区切り)
  const pattern5 = text.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/)
  if (pattern5) {
    const year = parseInt(pattern5[1])
    const month = parseInt(pattern5[2])
    const day = parseInt(pattern5[3])

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // === 年なし日付形式（後回し）===

  // パターン6: "11月7日" または "11/7"
  const pattern6 = text.match(/(\d{1,2})[月/](\d{1,2})/)
  if (pattern6) {
    const month = parseInt(pattern6[1])
    const day = parseInt(pattern6[2])

    // 月のバリデーション（1-12のみ）
    if (month < 1 || month > 12 || day < 1 || day > 31) return null

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    let year = currentYear

    // 同じ月の場合は日付まで比較
    if (month === currentMonth) {
      if (day < currentDay) {
        year = currentYear + 1  // 今月だが過去の日付 → 来年
      }
    } else if (month < currentMonth) {
      year = currentYear + 1  // 過去の月 → 来年
    }

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // パターン7: "11.7" (ドット区切り)
  const pattern7 = text.match(/(\d{1,2})\.(\d{1,2})/)
  if (pattern7) {
    const month = parseInt(pattern7[1])
    const day = parseInt(pattern7[2])

    // 月のバリデーション（1-12のみ）
    if (month < 1 || month > 12 || day < 1 || day > 31) return null

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    let year = currentYear

    // 同じ月の場合は日付まで比較
    if (month === currentMonth) {
      if (day < currentDay) {
        year = currentYear + 1  // 今月だが過去の日付 → 来年
      }
    } else if (month < currentMonth) {
      year = currentYear + 1  // 過去の月 → 来年
    }

    if (!isValidDate(year, month, day)) return null

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

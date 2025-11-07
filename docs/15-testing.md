# 15. テスト実施

## 概要
リリース前の包括的なテストを実施し、品質を保証します。

## 目的
- バグの早期発見と修正
- ユーザー体験の検証
- パフォーマンスの確認
- セキュリティの確保

## タスク

- [ ] ユニットテスト作成
- [ ] 統合テスト実施
- [ ] E2Eテスト実施
- [ ] パフォーマンステスト
- [ ] セキュリティテスト
- [ ] ブラウザ互換性テスト
- [ ] モバイルデバイステスト
- [ ] アクセシビリティテスト
- [ ] ユーザー受入テスト（UAT）

## テスト項目

### 1. ユニットテスト
```typescript
// __tests__/utils/date.test.ts
import { formatDate, getWeekRange } from '@/lib/utils/date'

describe('Date Utils', () => {
  test('formatDate formats date correctly', () => {
    const result = formatDate('2025-11-07')
    expect(result).toContain('2025年')
    expect(result).toContain('11月')
    expect(result).toContain('7日')
  })

  test('getWeekRange returns correct range', () => {
    const { start, end } = getWeekRange()
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(7)
  })
})
```

### 2. 統合テスト
```typescript
// __tests__/api/events.test.ts
import { createClient } from '@/lib/supabase/server'

describe('Events API', () => {
  test('fetch events by date', async () => {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', today)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})
```

### 3. E2Eテスト（Playwright）
```typescript
// e2e/event-list.spec.ts
import { test, expect } from '@playwright/test'

test('event list page displays events', async ({ page }) => {
  await page.goto('/')

  // ページタイトル確認
  await expect(page).toHaveTitle(/今日のイベント/)

  // イベントカードが表示される
  const eventCards = page.locator('[data-testid="event-card"]')
  await expect(eventCards.first()).toBeVisible()
})

test('event detail page shows information', async ({ page }) => {
  await page.goto('/')

  // 最初のイベントをクリック
  await page.locator('[data-testid="event-card"]').first().click()

  // 詳細ページに遷移
  await expect(page).toHaveURL(/\/event\//)

  // イベント情報が表示される
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('text=詳細を見る')).toBeVisible()
})
```

### 4. パフォーマンステスト
```bash
# Lighthouseでパフォーマンス測定
npm install -g lighthouse
lighthouse https://machi-event.vercel.app --view

# Core Web Vitals目標値
# - LCP (Largest Contentful Paint): < 2.5s
# - FID (First Input Delay): < 100ms
# - CLS (Cumulative Layout Shift): < 0.1
```

### 5. セキュリティチェックリスト
- [ ] XSS対策（ユーザー入力のエスケープ）
- [ ] SQLインジェクション対策（Supabase RLS）
- [ ] CSRF対策
- [ ] 環境変数の適切な管理
- [ ] HTTPS通信
- [ ] セキュリティヘッダー設定
- [ ] 依存関係の脆弱性スキャン

```bash
# 依存関係の脆弱性チェック
npm audit

# 修正可能な脆弱性を自動修正
npm audit fix
```

### 6. ブラウザ互換性テスト
| ブラウザ | バージョン | 確認項目 |
|---------|----------|---------|
| Chrome | 最新2バージョン | ✅ 全機能 |
| Safari | 最新2バージョン | ✅ 全機能 |
| Edge | 最新2バージョン | ✅ 全機能 |
| Firefox | 最新2バージョン | ✅ 全機能 |
| iOS Safari | iOS 14+ | ✅ モバイル機能 |
| Android Chrome | Android 10+ | ✅ モバイル機能 |

### 7. モバイルデバイステスト
- [ ] iPhone 12/13/14 (iOS Safari)
- [ ] Pixel 6/7 (Android Chrome)
- [ ] iPad (iPadOS Safari)
- [ ] 横画面表示
- [ ] タッチ操作
- [ ] スワイプジェスチャー

### 8. アクセシビリティテスト
```bash
# axe-coreでアクセシビリティチェック
npm install --save-dev @axe-core/playwright

# テスト実行
npx playwright test accessibility.spec.ts
```

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/')

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

チェックリスト:
- [ ] キーボード操作対応
- [ ] スクリーンリーダー対応
- [ ] 適切なコントラスト比
- [ ] altテキスト設定
- [ ] aria-label設定

### 9. スクレイピングテスト
- [ ] 全22サイトから正しくデータ取得
- [ ] 日付の正規化が正しい
- [ ] 重複判定が機能
- [ ] エラーハンドリングが適切
- [ ] ログが正しく記録される

### 10. LINE通知テスト
- [ ] 友だち追加で登録される
- [ ] ウェルカムメッセージが送信される
- [ ] 地域選択が機能する
- [ ] 毎朝8時に通知が届く
- [ ] Flex Messageが正しく表示される
- [ ] リッチメニューが表示される

## テスト環境

### Staging環境
- URL: https://machi-event-staging.vercel.app
- Supabaseプロジェクト: machi-event-staging
- テストデータで動作確認

## 受け入れ基準
- [ ] すべてのユニットテストが通過
- [ ] E2Eテストが通過
- [ ] Lighthouse スコア80以上
- [ ] セキュリティ脆弱性0件
- [ ] ブラウザ互換性確認完了
- [ ] モバイルデバイステスト完了
- [ ] アクセシビリティ違反0件
- [ ] UAT承認取得

## 関連ファイル
- `docs/16-deployment.md` - デプロイ
- `__tests__/` - テストファイル
- `e2e/` - E2Eテスト

## 依存関係
- 全機能の実装完了が必要

## 技術メモ

### テストツールセットアップ
```bash
# Jest + React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Playwright
npm install --save-dev @playwright/test

# テスト実行
npm test              # ユニットテスト
npm run test:e2e      # E2Eテスト
```

## 参考
- Jest: https://jestjs.io/
- Playwright: https://playwright.dev/
- Lighthouse: https://developer.chrome.com/docs/lighthouse/

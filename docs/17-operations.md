# 17. 運用・保守

## 概要
リリース後の継続的な運用・保守体制を確立します。

## 目的
- 安定したサービス提供
- 問題の早期発見と対応
- データの健全性維持
- ユーザーサポート

## タスク

- [ ] モニタリング体制構築
- [ ] ログ監視設定
- [ ] アラート設定
- [ ] バックアップ設定
- [ ] 定期メンテナンス計画
- [ ] インシデント対応フロー
- [ ] ドキュメント整備

## 運用項目

### 1. 日次運用

#### スクレイピング状況確認
```sql
-- 昨日のスクレイピング状況確認
SELECT
  site_name,
  status,
  events_count,
  error_message,
  created_at
FROM scraping_logs
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 失敗サイトの確認
SELECT
  site_name,
  COUNT(*) as failure_count
FROM scraping_logs
WHERE status = 'failure'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY site_name
HAVING COUNT(*) > 2  -- 7日間で3回以上失敗
ORDER BY failure_count DESC;
```

#### LINE通知状況確認
```sql
-- 通知配信状況
SELECT
  notification_type,
  total_users,
  success_count,
  failure_count,
  created_at
FROM notification_logs
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### 2. 週次運用

#### データベース健全性チェック
```sql
-- イベント数の推移
SELECT
  DATE(created_at) as date,
  COUNT(*) as event_count
FROM events
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- 重複イベントチェック
SELECT
  title,
  event_date,
  COUNT(*) as count
FROM events
GROUP BY title, event_date
HAVING COUNT(*) > 1;
```

#### パフォーマンス確認
- Vercel Analytics確認
- Supabaseダッシュボード確認
- ページ読み込み速度チェック
- エラー率確認

### 3. 月次運用

#### データクリーンアップ
```sql
-- 過去3ヶ月より古いイベントを削除
DELETE FROM events
WHERE event_date < CURRENT_DATE - INTERVAL '3 months';

-- 古いログを削除
DELETE FROM scraping_logs
WHERE created_at < CURRENT_DATE - INTERVAL '3 months';

DELETE FROM notification_logs
WHERE created_at < CURRENT_DATE - INTERVAL '3 months';
```

#### セキュリティアップデート
```bash
# 依存関係の更新確認
npm outdated

# セキュリティ脆弱性チェック
npm audit

# 更新適用
npm update
npm audit fix
```

#### バックアップ確認
- Supabase自動バックアップ確認
- 手動バックアップ実行（重要な変更前）

### 4. モニタリング設定

#### Supabase Dashboard
- Database Usage
- API Requests
- Storage Usage
- Edge Function Invocations

#### Vercel Dashboard
- Deployments
- Analytics
- Speed Insights
- Logs

#### アラート設定
```typescript
// supabase/functions/monitoring/index.ts
// 異常検知時にSlack/メール通知

interface Alert {
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
}

async function sendAlert(alert: Alert) {
  // Slack Webhook
  if (Deno.env.get('SLACK_WEBHOOK_URL')) {
    await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${alert.type.toUpperCase()}] ${alert.message}`,
        username: 'まちイベ監視bot'
      })
    })
  }

  // メール通知
  // ...
}

// 定期監視（1時間ごと）
Deno.cron("monitoring", "0 * * * *", async () => {
  // 直近1時間のスクレイピング失敗率をチェック
  const { data: logs } = await supabase
    .from('scraping_logs')
    .select('status')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  if (logs) {
    const failureRate = logs.filter(l => l.status === 'failure').length / logs.length

    if (failureRate > 0.3) {
      await sendAlert({
        type: 'critical',
        message: `スクレイピング失敗率が30%を超えています (${Math.round(failureRate * 100)}%)`,
        timestamp: new Date().toISOString()
      })
    }
  }
})
```

### 5. インシデント対応フロー

#### レベル1: 軽微（通常対応）
- 個別サイトのスクレイピング失敗
- 一部画像の表示エラー

**対応**:
1. エラーログ確認
2. 原因特定
3. 修正（1-2日以内）

#### レベル2: 中程度（優先対応）
- 複数サイトのスクレイピング失敗
- ページ表示エラー
- LINE通知の遅延

**対応**:
1. 即座にエラーログ確認
2. 緊急性を判断
3. 半日以内に修正
4. ユーザーへの影響を最小化

#### レベル3: 重大（緊急対応）
- サービス全体停止
- データベース障害
- セキュリティインシデント

**対応**:
1. 即座に状況確認
2. 必要に応じてロールバック
3. 原因特定と修正（数時間以内）
4. インシデントレポート作成
5. 再発防止策の検討

### 6. ユーザーサポート

#### LINE公式アカウントでの問い合わせ対応
```typescript
// 問い合わせキーワードに自動応答
async function handleUserMessage(event: any) {
  const message = event.message.text.toLowerCase()

  if (message.includes('使い方') || message.includes('ヘルプ')) {
    await sendMessage(event.source.userId, [
      {
        type: 'text',
        text: 'まちイベの使い方\n\n' +
              '1. Webサイトでイベントを検索\n' +
              '2. 毎朝8時に新着イベントをお知らせ\n' +
              '3. 地域を選択して絞り込み\n\n' +
              '詳しくはこちら: https://machi-event.vercel.app/help'
      }
    ])
  } else if (message.includes('地域変更')) {
    // 地域選択のクイックリプライを送信
    await sendRegionSelection(event.source.userId)
  }
}
```

### 7. 定期メンテナンス計画

#### 四半期ごと
- [ ] 全機能の動作確認
- [ ] パフォーマンスレビュー
- [ ] セキュリティレビュー
- [ ] ユーザーフィードバック分析
- [ ] 機能改善の検討

#### 半年ごと
- [ ] 依存関係の大幅更新
- [ ] アーキテクチャレビュー
- [ ] コスト最適化
- [ ] ドキュメント全体見直し

### 8. ドキュメント管理

#### 運用ドキュメント
- `docs/operations/daily-checklist.md` - 日次チェックリスト
- `docs/operations/incident-response.md` - インシデント対応手順
- `docs/operations/maintenance.md` - メンテナンス手順
- `docs/operations/troubleshooting.md` - トラブルシューティング

#### ナレッジベース
- よくある問題と解決策
- パフォーマンスチューニング履歴
- インシデント対応履歴

### 9. KPI管理

```sql
-- 月次KPIレポート
SELECT
  COUNT(DISTINCT line_user_id) as active_users,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE is_new = true) as new_events,
  AVG(events_per_site) as avg_events_per_site
FROM (
  SELECT
    source_site,
    COUNT(*) as events_per_site
  FROM events
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY source_site
) subquery
CROSS JOIN line_users
WHERE line_users.is_active = true;
```

目標KPI:
- LINE友だち登録: 20人（3ヶ月）
- 月間アクティブユーザー: 15人以上
- イベント情報網羅率: 80%以上
- サービス稼働率: 95%以上

## 受け入れ基準
- [ ] モニタリング体制が構築されている
- [ ] アラート設定が完了している
- [ ] バックアップ設定が完了している
- [ ] 運用ドキュメントが整備されている
- [ ] インシデント対応フローが確立している

## 関連ファイル
- `docs/05-error-handling.md` - エラーハンドリング
- `docs/16-deployment.md` - デプロイ

## 依存関係
- 全機能のリリース完了が必要

## 参考
- Supabase Monitoring: https://supabase.com/docs/guides/platform/metrics
- Vercel Analytics: https://vercel.com/docs/analytics

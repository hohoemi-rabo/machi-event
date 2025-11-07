# 02. データベース実装

## 概要
設計したデータベーススキーマをSupabaseに実装します。

## 目的
- Supabaseプロジェクトにテーブルを作成
- インデックスを設定してパフォーマンスを最適化
- RLSポリシーを適用してセキュリティを確保

## タスク

- [ ] Supabaseプロジェクト（machi-event）に接続
- [ ] eventsテーブル作成
- [ ] scraping_logsテーブル作成
- [ ] line_usersテーブル作成
- [ ] インデックス作成
- [ ] RLSポリシー適用
- [ ] マイグレーションファイル作成
- [ ] テストデータ投入

## 実装手順

### 1. Supabase MCPで接続確認
```bash
# プロジェクト情報確認
Project ID: dpeeozdddgmjsnrgxdpz
Region: ap-northeast-1 (東京)
```

### 2. マイグレーション実行
Supabase MCPの`apply_migration`を使用してテーブル作成

### 3. RLSポリシー例
```sql
-- eventsテーブル: 読み取りは誰でも可能
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
ON events FOR SELECT
TO public
USING (true);

-- 書き込みはサービスロールのみ
CREATE POLICY "Events are insertable by service role"
ON events FOR INSERT
TO service_role
WITH CHECK (true);
```

## 受け入れ基準
- [ ] すべてのテーブルが作成されている
- [ ] インデックスが正しく設定されている
- [ ] RLSポリシーが適用されている
- [ ] マイグレーションファイルがバージョン管理されている
- [ ] テストデータで動作確認完了

## 関連ファイル
- `docs/01-database-design.md` - 設計チケット
- `docs/03-scraping-core.md` - スクレイピング基盤（次のステップ）

## 依存関係
- `01-database-design.md` の完了が必要

## 技術メモ

### Supabase MCP使用例
```typescript
// テーブル一覧確認
mcp__supabase__list_tables({ project_id: "dpeeozdddgmjsnrgxdpz" })

// マイグレーション実行
mcp__supabase__apply_migration({
  project_id: "dpeeozdddgmjsnrgxdpz",
  name: "create_events_table",
  query: "CREATE TABLE events (...)"
})
```

## 参考
- Supabase Database: https://supabase.com/docs/guides/database
- PostgreSQL Indexes: https://www.postgresql.org/docs/current/indexes.html

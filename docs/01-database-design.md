# 01. データベース設計

## 概要
Supabase PostgreSQLでイベント情報を管理するためのデータベーススキーマを設計します。

## 目的
- イベント情報を効率的に保存・検索できる構造を設計
- スクレイピングログの記録
- 将来のLINE通知機能に対応

## タスク

- [ ] eventsテーブル設計
- [ ] scraping_logsテーブル設計
- [ ] line_usersテーブル設計（将来用）
- [ ] インデックス設計（検索パフォーマンス向上）
- [ ] RLS（Row Level Security）ポリシー検討
- [ ] ER図作成

## 詳細設計

### eventsテーブル
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  place TEXT,
  detail TEXT,
  source_url TEXT NOT NULL,
  source_site TEXT NOT NULL,
  region TEXT DEFAULT '飯田市',
  image_url TEXT,
  is_new BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### インデックス
```sql
-- 日付検索用
CREATE INDEX idx_events_event_date ON events(event_date);

-- 地域検索用
CREATE INDEX idx_events_region ON events(region);

-- 新着フィルター用
CREATE INDEX idx_events_is_new ON events(is_new);

-- 重複チェック用（複合インデックス）
CREATE INDEX idx_events_duplicate_check ON events(title, event_date, source_site);
```

### scraping_logsテーブル
```sql
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'partial')),
  events_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### line_usersテーブル（将来実装）
```sql
CREATE TABLE line_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT UNIQUE NOT NULL,
  regions TEXT[] DEFAULT ARRAY['飯田市'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 受け入れ基準
- [ ] すべてのテーブル定義がドキュメント化されている
- [ ] インデックス戦略が明確
- [ ] 重複判定ロジックが設計されている
- [ ] RLSポリシーが検討されている

## 関連ファイル
- `docs/02-database-implementation.md` - 実装チケット

## 依存関係
- なし（最初のチケット）

## 参考
- REQUIREMENTS.md: データベース設計セクション
- Supabase Docs: https://supabase.com/docs/guides/database

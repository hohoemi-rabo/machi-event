# 16. Vercel デプロイ

## 概要
Next.jsアプリケーションをVercelにデプロイし、本番環境を構築します。

## 目的
- 本番環境の構築
- CI/CDパイプラインの設定
- 環境変数の管理
- カスタムドメイン設定（オプション）

## タスク

- [ ] Vercelプロジェクト作成
- [ ] GitHubリポジトリ連携
- [ ] 環境変数設定
- [ ] ビルド設定確認
- [ ] デプロイ実行
- [ ] 本番環境動作確認
- [ ] カスタムドメイン設定（オプション）
- [ ] Analytics設定

## 実装手順

### 1. Vercelプロジェクト作成

```bash
# Vercel CLIインストール（オプション）
npm install -g vercel

# ログイン
vercel login

# プロジェクト初期化
vercel

# 本番デプロイ
vercel --prod
```

または、Vercelダッシュボードから:
1. https://vercel.com/new にアクセス
2. GitHubリポジトリをインポート
3. プロジェクト名: `machi-event`
4. フレームワーク: Next.js（自動検出）
5. ルートディレクトリ: `./`

### 2. ビルド設定

```json
// package.json (確認)
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

Vercel設定（自動検出されるが確認）:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. 環境変数設定

Vercelダッシュボードの Project Settings > Environment Variables:

```bash
# Production環境
NEXT_PUBLIC_SUPABASE_URL=https://dpeeozdddgmjsnrgxdpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Edge Functionsで使用（Supabase側で設定）
LINE_CHANNEL_ACCESS_TOKEN=your-line-access-token
LINE_CHANNEL_SECRET=your-line-secret
```

### 4. デプロイメント設定

**vercel.json** (オプション)
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hnd1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 5. デプロイメントフロー

#### 自動デプロイ
- `main`ブランチへのpush → 本番デプロイ
- その他ブランチへのpush → プレビューデプロイ
- Pull Request作成 → プレビューデプロイ

#### 手動デプロイ
```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 6. カスタムドメイン設定（オプション）

Vercelダッシュボード > Project Settings > Domains:

1. ドメイン追加: `machi-event.jp` (例)
2. DNS設定:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
3. SSL証明書自動取得（Let's Encrypt）

### 7. Vercel Analytics設定

```bash
# Vercel Analytics SDK インストール
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 8. パフォーマンス最適化

#### next.config.ts
```typescript
const nextConfig = {
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ]
  },

  // リダイレクト
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

### 9. モニタリング設定

Vercel ダッシュボードで確認:
- Deployment Logs
- Runtime Logs
- Analytics
- Speed Insights

### 10. ロールバック手順

デプロイに問題がある場合:
1. Vercelダッシュボード > Deployments
2. 正常なデプロイを選択
3. "Promote to Production" をクリック

## デプロイチェックリスト

### デプロイ前
- [ ] すべてのテストが通過
- [ ] ビルドエラーがない
- [ ] 環境変数が正しく設定されている
- [ ] .gitignoreが適切
- [ ] README.mdが更新されている

### デプロイ後
- [ ] 本番環境でページが表示される
- [ ] すべてのページが正しく動作する
- [ ] イベント一覧が表示される
- [ ] イベント詳細が表示される
- [ ] フィルタリングが動作する
- [ ] シェア機能が動作する
- [ ] レスポンシブデザインが機能する
- [ ] Lighthouseスコアが80以上
- [ ] Supabase接続が正常
- [ ] Edge Functionsが動作する

## 受け入れ基準
- [ ] 本番環境にデプロイ完了
- [ ] 全機能が正常に動作
- [ ] CI/CDパイプライン設定完了
- [ ] 環境変数が適切に設定
- [ ] Analytics設定完了
- [ ] ドキュメント更新完了

## 関連ファイル
- `docs/15-testing.md` - テスト
- `docs/17-operations.md` - 運用・保守
- `vercel.json` - Vercel設定
- `next.config.ts` - Next.js設定

## 依存関係
- `15-testing.md` の完了が必要

## トラブルシューティング

### ビルドエラー
```bash
# ローカルで本番ビルドテスト
npm run build

# エラーログ確認
vercel logs
```

### 環境変数エラー
- Vercelダッシュボードで環境変数を確認
- 再デプロイで環境変数を反映

## 参考
- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Vercel CLI: https://vercel.com/docs/cli

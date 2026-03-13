# グループ分けWebアプリ

イベント参加者をランダムにグループ分けするWebアプリ。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **DB**: Upstash Redis (`@upstash/redis`)
- **UI**: Tailwind CSS v4
- **QRコード**: `qrcode` パッケージ (クライアントサイド Canvas 描画)
- **ID生成**: `nanoid`
- **デプロイ先**: Vercel

## アーキテクチャ

### ページ構成
- `/` - イベント作成 (グループ数を選択)
- `/event/[id]/admin?token=xxx` - 管理者画面 (QRコード + 参加者の編集・削除・グループ移動)
- `/event/[id]/join` - 参加者画面 (名前入力 + グループ選択(任意) → グループ結果表示)
- `/event/[id]/result` - 閲覧専用ページ (グループ分け結果の閲覧のみ)

### API
- `POST /api/events` - イベント作成
- `GET /api/events/[id]` - イベント情報取得
- `POST /api/events/[id]/join` - 参加登録 (グループ指定 or 自動割当)
- `GET /api/events/[id]/participants` - 参加者一覧
- `DELETE /api/events/[id]/participants/[participantId]` - 参加者削除
- `PATCH /api/events/[id]/participants/[participantId]` - 参加者更新 (名前変更・グループ移動)

### データモデル (Redis)
- `event:{id}` - イベント情報 (JSON, TTL 24時間)
- `participants:{id}` - 参加者リスト (Sorted Set, TTL 24時間)

### 管理者認証
- URLトークン方式 (`adminToken` をクエリパラメータで渡す)
- ログイン機能は不要

### グループ割り当てロジック
- 最少人数のグループにランダム割当 (`src/lib/kv.ts` の `addParticipant`)

## 環境変数
- `KV_REST_API_URL` - Upstash Redis の REST API URL
- `KV_REST_API_TOKEN` - Upstash Redis の REST API トークン

## 開発コマンド
```bash
npm run dev    # 開発サーバー起動
npm run build  # ビルド
npm run lint   # ESLint
```

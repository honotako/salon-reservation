# ローズマリー 予約管理システム

個人経営の美容室向けの予約管理システムです。

LINE・電話・SNS などバラバラに届く予約を 1 か所にまとめて、美容師がかんたんに予約を管理できるようにすることを目的に作りました。

## 公開URL

https://salon-reservation-portfolio.vercel.app

### テスト用アカウント（美容師）

| 名前 | メールアドレス | パスワード |
|---|---|---|
| 田中敦子 | tanaka@example.com | password123 |
| 佐藤みか | sato@example.com | password123 |
| 安田雄太 | yasuda@example.com | password123 |

※ デモ用のデータです。どなたでも操作できるため、内容が変わっている場合があります。

## 背景

個人経営の美容室では、予約が LINE・電話・Instagram などから別々に届き、紙の台帳や頭の中で管理していることが多くあります。そのため、予約の重複や確認漏れが起きやすく、管理に手間がかかります。

このシステムでは、すべての予約を 1 か所に登録し、空き時間を自動で計算することで、予約管理の手間とミスを減らすことを目指しました。

## 主な機能

### 美容師側（完成）

| 画面 | できること |
|---|---|
| ログイン | メールアドレスとパスワードでログイン／ログアウト |
| Home | 本日の予約一覧と予約件数を表示 |
| 予約一覧 | カレンダーで予約と休日を表示。美容師ごとに色分け |
| 予約詳細 | 予約内容の確認、ステータス変更（来店済み・キャンセル・無断キャンセル）、削除 |
| 予約登録 | 既存のお客様／新しいお客様の予約を登録。空いている開始時間だけを選べる |
| 設定 | 営業時間、予約の刻み、定休日、臨時休業日の設定 |

### お客様側（※作成予定）

- Web からの予約、予約の確認・変更・キャンセル

## 使用技術

| 分類 | 使用技術 |
|---|---|
| 言語 | TypeScript |
| フレームワーク | Next.js 16（App Router）、React 19 |
| スタイル | Tailwind CSS v4 |
| データベース | PostgreSQL 18 |
| ORM | Prisma 7 |
| 認証 | Better Auth |
| カレンダー | FullCalendar |
| 開発環境 | Docker（PostgreSQL）、Volta（Node.js のバージョン管理） |
| 公開 | Vercel、Neon |

## 構成

```
ブラウザ → Vercel（Next.js） → Neon（PostgreSQL）
GitHub の main にマージ → Vercel が自動でビルドして公開
```

AWS で動かす場合の構成（EC2・RDS・VPC・Systems Manager・GitHub Actions）も設計しています。詳しくは [docs/architecture.md](docs/architecture.md) をご覧ください。

## 工夫したところ

- **空き時間の自動計算**：営業時間・予約の刻み・メニューの所要時間・定休日・既存の予約から、予約できる開始時間だけを表示します。保存の直前にもう一度空きを確認し、同じ時間に予約が重ならないようにしています。
- **2段構えのログインチェック**：proxy（ページを開く前）と layout（画面を作るとき）の両方でログインを確認し、さらにサーバー側の処理（Server Actions）の中でも確認しています。
- **論理削除**：予約・メニュー・美容師は、削除してもデータを残し、「削除済み」の印を付ける形にしています。
- **タイムゾーンの扱い**：公開先のサーバーは UTC で動くため、「今日」の判定や予約の日時は日本時間を指定して作っています。
- **ステータス変更の競合対策**：「予約中」のときだけ変更できる条件で更新し、別の画面から同時に操作されても不整合が起きないようにしています。

## ローカルでの起動方法

```bash
# 1. リポジトリを取得
git clone https://github.com/honotako/salon-reservation.git
cd salon-reservation

# 2. パッケージをインストール
npm install

# 3. .env を作成（値は自分の環境に合わせて設定）
# DATABASE_URL="postgresql://salon:salon_password@localhost:5433/salon_reservation"
# BETTER_AUTH_SECRET="openssl rand -base64 32 で作った文字列"
# BETTER_AUTH_URL="http://localhost:3000"

# 4. DB を起動
docker compose up -d

# 5. テーブルを作成してテストデータを入れる
npx prisma migrate dev
npx prisma db seed

# 6. 開発サーバーを起動
npm run dev
```

http://localhost:3000 を開くと、ログイン画面が表示されます。

## 開発の進め方

- 要件定義・画面設計・テーブル設計を先に行い、[docs](docs) にまとめてから実装しました。
- Git は `main`（本番）・`develop`（開発）・作業ごとの `feature/〇〇` ブランチに分け、プルリクエストでマージしています。
- 設計と判断は自分で行い、実装は AI を活用しながら進めました。コードはすべて理解し、説明できる状態にしています。

## 今後の予定

- お客様側の予約画面
- 予約内容の変更
- 予約登録でのお客様の検索
- AWS での構築と構成図の作成

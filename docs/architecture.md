# 公開・インフラ構成

## 現在の公開環境

```
ブラウザ → Vercel（Next.js アプリ） → Neon（PostgreSQL）
```


| 項目     | 内容                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------ |
| 公開 URL | [https://salon-reservation-portfolio.vercel.app](https://salon-reservation-portfolio.vercel.app) |
| アプリ    | Vercel（Hobby プラン）                                                                                |
| DB     | Neon（Free プラン、AWS US East 1）                                                                     |
| 本番ブランチ | `main`。main にマージすると Vercel が自動でビルドして公開する                                                         |
| プレビュー  | main 以外のブランチを push すると、お試し用の URL が作られる                                                           |
| 費用     | 0 円。上限を超えても自動で課金されない                                                                             |




### 選んだ理由

- 費用をかけずに常に公開しておけるので、どなたでも 閲覧可能
- Next.js と Vercel は相性がよく、GitHub と連携するだけで自動公開できる
- アプリ（Vercel）と DB（Neon）を同じアメリカ東部に置いて、アプリと DB の通信を速くした。1 画面で DB には何度も問い合わせるため



### 環境変数


| 名前                   | 内容                      |
| -------------------- | ----------------------- |
| `DATABASE_URL`       | Neon の接続文字列（接続プールあり）    |
| `BETTER_AUTH_SECRET` | ログイン用の秘密の鍵。開発用とは別のものを使う |
| `BETTER_AUTH_URL`    | 公開 URL                  |




### ビルド

`package.json` の build で、先に Prisma のクライアントを作ってから Next.js をビルドする。`src/generated/prisma` は GitHub に上げていないため。

```json
"build": "prisma generate && next build"
```



### DB の更新

マイグレーションとテストデータは、手元の Mac から Neon の直接接続（接続プールなし）で実行する。

```bash
DATABASE_URL="Neon の直接接続の文字列" npx prisma migrate deploy
```

※ seed は全データを消してから入れ直すため、公開後は Neon に向けて実行しない。

## 開発の流れ

```
feature/〇〇 ──PR──▶ develop ──PR──▶ main ──自動──▶ Vercel で公開
```



## AWS で動かす場合の構成（設計）

AWS 上でも動かせるように構成を設計した。一時的に構築して構成図とスクリーンショットを残し、費用がかからないよう削除する予定。

```
利用者のブラウザ
   │ HTTP
   ▼
┌─────────────── VPC（東京リージョン）───────────────┐
│  パブリックサブネット          プライベートサブネット   │
│  EC2（Next.js）  ───────▶   RDS（PostgreSQL）       │
│  SG：HTTP のみ               SG：EC2 からのみ          │
│  ポート22は開けない                                  │
└──────────────────────────────────────┘
     ▲                    ▲
 Parameter Store     Systems Manager ◀── GitHub Actions
 （秘密の値）          （EC2 でコマンド実行）   （IAM ロールで操作）
```


| 項目       | 採用                                                       | 理由                               |
| -------- | -------------------------------------------------------- | -------------------------------- |
| アプリ      | EC2                                                      | 小規模なのでシンプルな構成にした                 |
| DB       | RDS（PostgreSQL）                                          | バックアップなどの管理を AWS に任せられる          |
| ネットワーク   | EC2 はパブリックサブネット、RDS はプライベートサブネット                         | DB に外から直接つなげないようにする              |
| 接続ルール    | RDS のセキュリティグループは EC2 からのみ許可                              | アプリ以外から DB に入れないようにする            |
| 入口       | EC2 に直接アクセス（ALB なし）                                      | アクセスが少なく、ALB の月額費用を抑えるため         |
| 秘密の値     | Systems Manager Parameter Store                          | `.env` をサーバーにファイルで置かない           |
| サーバーへの接続 | Session Manager                                          | SSH のポート22を開けずに済む                |
| 通信       | HTTP                                                     | HTTPS には ALB か独自ドメインが必要で費用がかかるため |
| デプロイ     | GitHub Actions → IAM ロール → Systems Manager で EC2 にコマンド実行 | SSH を使わず、ポートを開けずに自動デプロイできる       |




### 今後の拡張

- アクセスが増えたら、ALB を前に置いて EC2 を複数台にする
- ALB と AWS Certificate Manager の証明書で HTTPS にする
- RDS をマルチ AZ にして、障害に強くする


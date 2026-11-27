# テーブル設計

DB は PostgreSQL。Prisma で管理する（`prisma/schema.prisma`）。日時は UTC で保存し、画面では日本時間で表示する。

## テーブル一覧

| テーブル | 内容 | 削除のしかた |
|---|---|---|
| customers | お客様 | - |
| stylists | 美容師 | 論理削除 |
| menus | メニュー | 論理削除 |
| reservations | 予約 | 論理削除 |
| store_settings | 店舗の設定（1 行だけ） | - |
| holidays | 定休日・臨時休業日 | 物理削除 |
| user / session / account / verification | ログイン用（Better Auth） | - |

## ER 図

```
user 1 ── 0..1 stylists 1 ── * reservations * ── 1 customers
                                   │
                                   * ── 1 menus
```

## 各テーブル

### customers（お客様）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| name | String | 名前 |
| email | String? | メールアドレス |
| phone | String? | 電話番号 |
| created_at / updated_at | DateTime | 作成・更新日時 |

### stylists（美容師）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| user_id | String（ユニーク） | ログイン用の user と 1 対 1 |
| name | String | 名前 |
| profile | String? | プロフィール |
| is_deleted | Boolean | 削除済みの印 |
| created_at / updated_at | DateTime | 作成・更新日時 |

メールアドレスとパスワードは Better Auth の user / account テーブルで管理する。

### menus（メニュー）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| name | String | メニュー名 |
| price | Int | 料金（円） |
| description | String? | 説明 |
| duration_minutes | Int | 所要時間（分） |
| is_deleted | Boolean | 削除済みの印 |

### reservations（予約）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| customer_id | Int | お客様 |
| stylist_id | Int | 美容師 |
| menu_id | Int | メニュー |
| start_at | DateTime | 開始日時 |
| end_at | DateTime | 終了日時（開始＋メニューの所要時間） |
| source | ReservationSource | 予約経路 |
| status | ReservationStatus | 状態（初期値は reserved） |
| note | String? | 要望 |
| is_deleted | Boolean | 削除済みの印（初期値 false） |
| created_at / updated_at | DateTime | 作成・更新日時 |

インデックス：`(stylist_id, start_at)`（美容師ごとの空き時間の計算で使う）

### store_settings（店舗の設定）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| open_time | Time | 開店時刻 |
| close_time | Time | 閉店時刻 |
| slot_minutes | Int | 予約の刻み（分） |

### holidays（休日）

| 列 | 型 | 説明 |
|---|---|---|
| id | Int | 主キー |
| type | HolidayType | weekly（毎週）または temporary（臨時） |
| weekday | Int? | 曜日（0＝日〜6＝土）。weekly のとき |
| date | Date? | 日付。temporary のとき |
| reason | String? | 理由 |

## 列挙型

| 型 | 値 |
|---|---|
| ReservationSource | web、phone、line、instagram、other |
| ReservationStatus | reserved（予約中）、visited（来店済み）、canceled（キャンセル）、no_show（無断キャンセル） |
| HolidayType | weekly、temporary |

## 設計で決めたこと

- 予約・メニュー・美容師は、過去の予約の記録を残すために論理削除にした
- 臨時休業日は、間違えて登録したものを消せるように物理削除にした
- 定休日と臨時休業日は、1 つの holidays テーブルに type で分けて入れた
- 美容師のログイン情報は Better Auth に任せ、stylists は user と 1 対 1 でつなげた

## マイグレーション履歴

| 名前 | 内容 |
|---|---|
| init | 最初のテーブル |
| add-better-auth | ログイン用のテーブル、stylists.user_id |
| add-reservation-note | reservations.note |
| add-reservation-is-deleted | reservations.is_deleted |

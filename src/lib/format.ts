// 予約の状態を日本語にする
export const statusLabel = {
    reserved: "予約済み",
    visited: "来店済み",
    canceled: "キャンセル",
    no_show: "無断キャンセル",
  };
  
  // 予約経路を日本語にする
  export const sourceLabel = {
    web: "ネット予約",
    phone: "電話",
    line: "LINE",
    instagram: "Instagram",
    other: "その他",
  };
  
  // 日時から「10:00」のような時刻を取り出す
  export const formatTime = (date: Date) =>
    date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });
  
  // 日時から「2026年11月24日(火)」のような日付を取り出す
  export const formatDate = (date: Date) =>
    date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Tokyo",
    });
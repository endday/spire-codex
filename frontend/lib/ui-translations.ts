/**
 * UI string translations for non-game-data text across the site.
 * Game data (card names, descriptions, etc.) comes from the API.
 * These are for chrome/UI elements like tab labels, buttons, headings.
 *
 * Falls back to English for any missing translation.
 */

const UI_STRINGS: Record<string, Record<string, string>> = {
  // Tab labels
  "overview": { deu: "Übersicht", esp: "Resumen", fra: "Aperçu", ita: "Panoramica", jpn: "概要", kor: "개요", pol: "Przegląd", ptb: "Visão geral", rus: "Обзор", spa: "Resumen", tha: "ภาพรวม", tur: "Genel Bakış", zhs: "概览" },
  "details": { deu: "Details", esp: "Detalles", fra: "Détails", ita: "Dettagli", jpn: "詳細", kor: "상세", pol: "Szczegóły", ptb: "Detalhes", rus: "Детали", spa: "Detalles", tha: "รายละเอียด", tur: "Detaylar", zhs: "详情" },
  "info": { deu: "Info", esp: "Info", fra: "Info", ita: "Info", jpn: "情報", kor: "정보", pol: "Info", ptb: "Info", rus: "Инфо", spa: "Info", tha: "ข้อมูล", tur: "Bilgi", zhs: "信息" },

  // Navigation
  "back_to": { deu: "Zurück zu", esp: "Volver a", fra: "Retour à", ita: "Torna a", jpn: "戻る：", kor: "돌아가기:", pol: "Powrót do", ptb: "Voltar para", rus: "Назад к", spa: "Volver a", tha: "กลับไป", tur: "Geri dön:", zhs: "返回" },
  "home": { deu: "Startseite", esp: "Inicio", fra: "Accueil", ita: "Home", jpn: "ホーム", kor: "홈", pol: "Strona główna", ptb: "Início", rus: "Главная", spa: "Inicio", tha: "หน้าแรก", tur: "Ana Sayfa", zhs: "首页" },

  // Search & filters
  "search": { deu: "Suchen...", esp: "Buscar...", fra: "Rechercher...", ita: "Cerca...", jpn: "検索...", kor: "검색...", pol: "Szukaj...", ptb: "Pesquisar...", rus: "Поиск...", spa: "Buscar...", tha: "ค้นหา...", tur: "Ara...", zhs: "搜索..." },
  "all_colors": { deu: "Alle Farben", esp: "Todos los colores", fra: "Toutes les couleurs", ita: "Tutti i colori", jpn: "すべての色", kor: "모든 색상", pol: "Wszystkie kolory", ptb: "Todas as cores", rus: "Все цвета", spa: "Todos los colores", tha: "ทุกสี", tur: "Tüm Renkler", zhs: "所有颜色" },
  "all_types": { deu: "Alle Typen", esp: "Todos los tipos", fra: "Tous les types", ita: "Tutti i tipi", jpn: "すべてのタイプ", kor: "모든 유형", pol: "Wszystkie typy", ptb: "Todos os tipos", rus: "Все типы", spa: "Todos los tipos", tha: "ทุกประเภท", tur: "Tüm Türler", zhs: "所有类型" },
  "all_rarities": { deu: "Alle Seltenheiten", esp: "Todas las rarezas", fra: "Toutes les raretés", ita: "Tutte le rarità", jpn: "すべてのレアリティ", kor: "모든 희귀도", pol: "Wszystkie rzadkości", ptb: "Todas as raridades", rus: "Все редкости", spa: "Todas las rarezas", tha: "ทุกความหายาก", tur: "Tüm Nadirlikler", zhs: "所有稀有度" },
  "results": { deu: "Ergebnisse", esp: "resultados", fra: "résultats", ita: "risultati", jpn: "件", kor: "결과", pol: "wyników", ptb: "resultados", rus: "результатов", spa: "resultados", tha: "ผลลัพธ์", tur: "sonuç", zhs: "结果" },

  // Detail page sections
  "merchant_price": { deu: "Händlerpreis", esp: "Precio del mercader", fra: "Prix du marchand", ita: "Prezzo del mercante", jpn: "商人の価格", kor: "상인 가격", pol: "Cena kupca", ptb: "Preço do mercador", rus: "Цена торговца", spa: "Precio del mercader", tha: "ราคาพ่อค้า", tur: "Tüccar Fiyatı", zhs: "商人价格" },
  "powers_applied": { deu: "Angewandte Kräfte", esp: "Poderes aplicados", fra: "Pouvoirs appliqués", ita: "Poteri applicati", jpn: "適用パワー", kor: "적용 파워", pol: "Zastosowane moce", ptb: "Poderes aplicados", rus: "Применяемые силы", spa: "Poderes aplicados", tha: "พลังที่ใช้", tur: "Uygulanan Güçler", zhs: "应用能力" },
  "related_cards": { deu: "Verwandte Karten", esp: "Cartas relacionadas", fra: "Cartes liées", ita: "Carte correlate", jpn: "関連カード", kor: "관련 카드", pol: "Powiązane karty", ptb: "Cartas relacionadas", rus: "Связанные карты", spa: "Cartas relacionadas", tha: "การ์ดที่เกี่ยวข้อง", tur: "İlgili Kartlar", zhs: "相关卡牌" },
  "other_languages": { deu: "Andere Sprachen", esp: "Otros idiomas", fra: "Autres langues", ita: "Altre lingue", jpn: "他の言語", kor: "다른 언어", pol: "Inne języki", ptb: "Outros idiomas", rus: "Другие языки", spa: "Otros idiomas", tha: "ภาษาอื่น", tur: "Diğer Diller", zhs: "其他语言" },
  "version_history": { deu: "Versionsgeschichte", esp: "Historial de versiones", fra: "Historique des versions", ita: "Cronologia versioni", jpn: "バージョン履歴", kor: "버전 기록", pol: "Historia wersji", ptb: "Histórico de versões", rus: "История версий", spa: "Historial de versiones", tha: "ประวัติเวอร์ชัน", tur: "Sürüm Geçmişi", zhs: "版本历史" },
  "gold": { deu: "Gold", esp: "Oro", fra: "Or", ita: "Oro", jpn: "ゴールド", kor: "골드", pol: "Złoto", ptb: "Ouro", rus: "Золото", spa: "Oro", tha: "ทอง", tur: "Altın", zhs: "金币" },

  // Sort
  "compendium": { deu: "Kompendium", esp: "Compendio", fra: "Compendium", ita: "Compendio", jpn: "図鑑順", kor: "도감", pol: "Kompendium", ptb: "Compêndio", rus: "Компендиум", spa: "Compendio", tha: "สารานุกรม", tur: "Ansiklopedi", zhs: "图鉴" },
};

/**
 * Get a translated UI string.
 * Returns the translation for the given lang, or English fallback.
 */
export function t(key: string, lang: string): string {
  if (lang === "eng") return key;
  const translations = UI_STRINGS[key.toLowerCase()];
  if (!translations) return key;
  return translations[lang] || key;
}

/**
 * Capitalize first letter (for display).
 */
export function tCap(key: string, lang: string): string {
  const result = t(key, lang);
  return result.charAt(0).toUpperCase() + result.slice(1);
}

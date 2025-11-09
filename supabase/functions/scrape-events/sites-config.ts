/**
 * 28サイトの設定
 * site-list.mdから作成
 */

export interface SiteConfig {
  name: string
  url: string
  region: string
  type: 'rss' | 'html'
  selector?: string // HTML用
  fields?: {
    title?: string
    date?: string
    place?: string
    link?: string
  }
}

export const SITES: SiteConfig[] = [
  // ===== RSS対応サイト (7サイト) =====
  {
    name: '高森町役場',
    url: 'https://www.town.nagano-takamori.lg.jp/oshirase/oshirase/rss.xml',
    region: '高森町',
    type: 'rss'
  },
  {
    name: '松川町役場',
    url: 'https://www.town.matsukawa.lg.jp/cgi-bin/feed.php?new1=1',
    region: '松川町',
    type: 'rss'
  },
  {
    name: '阿智村役場',
    url: 'https://www.vill.achi.lg.jp/rss/10/list1.xml',
    region: '阿智村',
    type: 'rss'
  },
  {
    name: '平谷村役場（新着情報）',
    url: 'https://www.hirayamura.jp/files/rss/block1346.xml',
    region: '平谷村',
    type: 'rss'
  },
  {
    name: '平谷村役場（イベント）',
    url: 'https://www.hirayamura.jp/files/rss/block1347.xml',
    region: '平谷村',
    type: 'rss'
  },
  {
    name: '泰阜村役場',
    url: 'https://www.vill.yasuoka.nagano.jp/news/rss.xml',
    region: '泰阜村',
    type: 'rss'
  },
  {
    name: '喬木村役場',
    url: 'https://www.vill.takagi.lg.jp/category/bunya/kanko/event/index.rss',
    region: '喬木村',
    type: 'rss'
  },

  // ===== HTMLサイト (21サイト) =====
  {
    name: '飯田市役所',
    url: 'https://www.city.iida.lg.jp/life/3/16/index-2.html',
    region: '飯田市',
    type: 'html',
    selector: '.event-item', // 実際の構造に合わせて調整
    fields: {
      title: '.event-title',
      date: '.event-date',
      place: '.event-place',
      link: 'a'
    }
  },
  {
    name: '南信州ナビ',
    url: 'https://msnav.com/events/',
    region: '飯田市',
    type: 'html',
    selector: '.event-list .event',
    fields: {
      title: '.title',
      date: '.date',
      link: 'a'
    }
  },
  {
    name: '阿智誘客促進協議会',
    url: 'http://info.sva.jp/news_cat/news/',
    region: '阿智村',
    type: 'html'
  },
  {
    name: '天空の楽園',
    url: 'https://sva.jp/nightfes2025/news/',
    region: '阿智村',
    type: 'html'
  },
  {
    name: '阿智☆昼神観光局（地域のお知らせ）',
    url: 'https://hirugamionsen.jp/',
    region: '阿智村',
    type: 'html'
  },
  {
    name: '阿智☆昼神観光局（昼神観光局からのお知らせ）',
    url: 'https://hirugamionsen.jp/news/',
    region: '阿智村',
    type: 'html'
  },
  {
    name: '根羽村役場',
    url: 'https://www.nebamura.jp/nebatopics/news/',
    region: '根羽村',
    type: 'html'
  },
  {
    name: '下条村観光協会',
    url: 'https://shimojo-kanko.jp/news.html',
    region: '下条村',
    type: 'html'
  },
  {
    name: '売木村役場',
    url: 'https://www.urugi.jp/latest_news/',
    region: '売木村',
    type: 'html'
  },
  {
    name: '売木村商工会',
    url: 'https://urugisho.jp/information.html',
    region: '売木村',
    type: 'html'
  },
  {
    name: '天龍村役場（お知らせ）',
    url: 'https://www.vill-tenryu.jp/category/notice/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村役場（行政情報）',
    url: 'https://www.vill-tenryu.jp/category/notice/administrative/government_info/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村役場（くらしと手続き）',
    url: 'https://www.vill-tenryu.jp/category/notice/administrative/living_info/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村役場（健康・福祉）',
    url: 'https://www.vill-tenryu.jp/category/notice/administrative/health_welfare/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村役場（子育て・教育）',
    url: 'https://www.vill-tenryu.jp/category/notice/administrative/education/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村役場（観光情報）',
    url: 'https://www.vill-tenryu.jp/category/tourism/tourism_info/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '天龍村（イベント総合案内）',
    url: 'https://www.vill-tenryu.jp/tourism/event/event/',
    region: '天龍村',
    type: 'html'
  },
  {
    name: '豊丘村役場',
    url: 'https://www.vill.nagano-toyooka.lg.jp/',
    region: '豊丘村',
    type: 'html'
  },
  {
    name: '豊丘村役場（とよおか祭り情報）',
    url: 'https://www.vill.nagano-toyooka.lg.jp/02kankou/toyookamatsuri/',
    region: '豊丘村',
    type: 'html'
  },
  {
    name: '大鹿村役場（お知らせ）',
    url: 'http://www.vill.ooshika.nagano.jp/category/whatsnew/',
    region: '大鹿村',
    type: 'html'
  },
  {
    name: '大鹿村環境協会',
    url: 'https://ooshika-kanko.com/',
    region: '大鹿村',
    type: 'html'
  }
]

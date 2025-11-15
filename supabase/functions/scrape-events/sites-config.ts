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
  // ===== RSS対応サイト (8サイト) =====
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

  {
    name: '飯田市役所',
    url: 'https://www.city.iida.lg.jp/rss/10/list1.xml',
    region: '飯田市',
    type: 'rss'
  },

  // ===== HTMLサイト (20サイト) =====
  {
    name: '南信州ナビ',
    url: 'https://msnav.com/events/',
    region: '南信州',
    type: 'html',
    selector: '.xo-event-list dl',
    fields: {
      title: 'dd .title',
      date: 'dt .event-date',
      link: 'dd .title a'
    }
  },
  {
    name: '阿智誘客促進協議会',
    url: 'http://info.sva.jp/news_cat/news/',
    region: '阿智村',
    type: 'html',
    selector: 'ul.list_topics li',
    fields: {
      title: 'p.title',
      date: 'p.day',
      link: 'a'
    }
  },
  {
    name: '天空の楽園',
    url: 'https://sva.jp/information/news/',
    region: '阿智村',
    type: 'html',
    selector: 'ul.list_blog__low li',
    fields: {
      title: 'h3',
      date: 'div.blog_content',
      link: 'a'
    }
  },
  {
    name: '阿智☆昼神観光局（地域のお知らせ）',
    url: 'https://hirugamionsen.jp/',
    region: '阿智村',
    type: 'html',
    selector: 'ul.list_info li',
    fields: {
      title: 'h3.title',
      date: 'p.day',
      link: 'a'
    }
  },
  {
    name: '阿智☆昼神観光局（昼神観光局からのお知らせ）',
    url: 'https://hirugamionsen.jp/news/',
    region: '阿智村',
    type: 'html',
    selector: 'ul.list_blog li',
    fields: {
      title: 'div.blog_r p.title',
      date: 'div.blog_r p.day',
      link: 'a'
    }
  },
  {
    name: '根羽村役場',
    url: 'https://www.nebamura.jp/nebatopics/news/',
    region: '根羽村',
    type: 'html',
    selector: 'div.news_cont ul li',
    fields: {
      title: 'a:nth-child(2)',
      date: 'span.date',
      link: 'a:nth-child(2)'
    }
  },
  {
    name: '下条村観光協会',
    url: 'https://shimojo-kanko.jp/news.html',
    region: '下条村',
    type: 'html',
    selector: 'div#mainlist ul li',
    fields: {
      title: 'a',
      date: 'a',
      link: 'a'
    }
  },
  {
    name: '売木村役場',
    url: 'https://www.urugi.jp/latest_news/',
    region: '売木村',
    type: 'html',
    selector: 'div#list a.entry-card-wrap',
    fields: {
      title: 'h2.entry-card-title',
      date: 'span.entry-date',
      link: '' // 親要素のa tagのhrefを使用
    }
  },
  {
    name: '売木村商工会',
    url: 'https://urugisho.jp/information.html',
    region: '売木村',
    type: 'html',
    selector: 'div#mainlist ul li',
    fields: {
      title: 'a',
      date: 'span.fs11',
      link: 'a'
    }
  },
  {
    name: '天龍村役場（お知らせ）',
    url: 'https://www.vill-tenryu.jp/',
    region: '天龍村',
    type: 'html',
    selector: 'div#top_info_content ul li',
    fields: {
      title: 'a',
      date: 'a',
      link: 'a'
    }
  },
  {
    name: '天龍村役場（行政情報）',
    url: 'https://www.vill-tenryu.jp/administrative/',
    region: '天龍村',
    type: 'html',
    selector: 'div#g_info_content ul li',
    fields: {
      title: 'a',
      date: 'a',
      link: 'a'
    }
  },
  {
    name: '天龍村役場（観光情報）',
    url: 'https://www.vill-tenryu.jp/tourism/',
    region: '天龍村',
    type: 'html',
    selector: 'ul#k_news_body li',
    fields: {
      title: 'a',
      date: 'a',
      link: 'a'
    }
  },
  {
    name: '豊丘村役場',
    url: 'https://www.vill.nagano-toyooka.lg.jp/',
    region: '豊丘村',
    type: 'html',
    selector: '.news__list li.news__list__item',
    fields: {
      title: 'dd a',
      date: 'dt',
      link: 'dd a'
    }
  },
  {
    name: '大鹿村役場（お知らせ）',
    url: 'http://www.vill.ooshika.nagano.jp/category/whatsnew/',
    region: '大鹿村',
    type: 'html',
    selector: 'div#in_contents ul.ichiran_ul li',
    fields: {
      title: 'p:nth-child(2)',
      date: 'p:first-child',
      link: 'a.new-link'
    }
  },
  {
    name: '大鹿村環境協会',
    url: 'https://ooshika-kanko.com/eventlist/',
    region: '大鹿村',
    type: 'html',
    selector: 'ul.wp-block-post-template li.wp-block-post',
    fields: {
      title: 'h3.wp-block-post-title a',
      date: 'h3.wp-block-post-title a',
      link: 'h3.wp-block-post-title a'
    }
  },
  {
    name: '天龍峡温泉観光協会',
    url: 'https://tenryukyou.com/blog/',
    region: '飯田市',
    type: 'html',
    selector: 'article.post-item',
    fields: {
      title: 'h2.entry-title a',
      date: 'div.date_label',
      link: 'h2.entry-title a'
    }
  },
  {
    name: '遠山観光協会',
    url: 'https://tohyamago.com/',
    region: '飯田市',
    type: 'html',
    selector: 'li.p-postList__item',
    fields: {
      title: 'h2.p-postList__title',
      date: 'time.c-postTimes__posted',
      link: 'a.p-postList__link'
    }
  },
  {
    name: '飯田市美術博物館',
    url: 'https://www.iida-museum.org/info/',
    region: '飯田市',
    type: 'html',
    selector: 'div.blog-item.mas-item',
    fields: {
      title: 'h1.entry-title a',
      date: 'time.entry-date.published',
      link: 'h1.entry-title a'
    }
  }
]

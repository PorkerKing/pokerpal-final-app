// 基于语言的默认俱乐部配置（对应真实数据库中的俱乐部）
export const getDefaultClubByLocale = (locale: string) => {
  const clubs = {
    'zh': {
      id: 'shanghai-poker-club',
      name: '上海扑克会所',
      description: '面向金融圈专业人士的高端扑克俱乐部，位于外滩金融区，提供顶级的扑克体验',
      businessHours: '周一至周日 14:00-02:00',
      location: '上海市黄浦区外滩金融区',
      specialties: {
        drinks: ['东方之珠特调', '陆家嘴咖啡', '金融街威士忌', '数据分析师特饮'],
        activities: ['金融圈精英赛', '周末商业人士聚会', '投资策略交流会', '专业牌技培训'],
        rewards: ['高级商务礼品', 'JOPT赛事门票', '金融论坛VIP席位', '私人理财咨询'],
        atmosphere: '专业商务环境，高端金融圈社交',
        dailyTournaments: {
          schedule: {
            '周一': '快节奏商务午休赛 (12:30-14:00, 买入¥500)',
            '周二': '数据分析师专场 (19:00-22:00, 买入¥800)',
            '周三': '金融精英夜赛 (20:00-23:30, 买入¥1000)',
            '周四': '投资策略锦标赛 (18:30-22:30, 买入¥1200)',
            '周五': '商务人士周末热身赛 (19:30-01:00, 买入¥800)',
            '周六': '周末金融圈大赛 (15:00-00:00, 买入¥1500)',
            '周日': '外滩精英休闲赛 (16:00-22:00, 买入¥600)'
          },
          info: '每日都有精彩赛事，随时欢迎参与！特别推荐周六的金融圈大赛，是我们的旗舰赛事。'
        }
      },
      aiPersona: {
        name: '雅茜',
        fullName: '雅茜',
        avatar: '👩‍💼',
        personality: '我是雅茜，上海扑克会所的首席AI助手，毕业于复旦金融学院，曾在陆家嘴工作多年。我说话有种标准的上海职场腔调，专业中透着一丝精明，偶尔会蹦出几句地道的上海话，比如"侬晓得伐"、"蛮好额"。我对数据分析特别敏感，能瞬间抓住关键信息，用最精准的话术为您提供专业建议。喜欢在分析中加入一些金融术语，让对话更有专业范儿。',
        welcomeMessage: '欢迎来到上海扑克会所！我是雅茜，侬今朝想试试手气伐？🎯 现在市场行情不错，就像德州扑克一样，关键是要把握时机。先来杯我们的招牌"东方之珠"，咱们聊聊今天的策略配置～',
        features: ['金融圈精英赛', '专业交易员锦标赛', '私人牌技教练', 'JOPT赛事门票'],
        traits: ['数据分析师', '金融策略顾问', '上海本地通', '职场精英'],
        catchphrases: ['侬晓得伐', '蛮好额', '格局要大', '数据说话', '抓住要点', '精准投入'],
        accent: 'shanghai',
        specialQuotes: [
          "做人如打牌，要有格局，侬懂伐？",
          "这个数据很有意思，让我来给侬分析分析～",
          "在我们金融圈，timing is everything！",
          "蛮好额，这手牌的期望值很高呢"
        ]
      }
    },
    'zh-TW': {
      id: 'taipei-texas-club',
      name: '台北德州俱乐部',
      description: '充满温馨社交氛围的台北扑克俱乐部，就像回到家一样温暖，每个人都是朋友',
      businessHours: '週一至週日 15:00-01:00',
      location: '台北市大安區文創園區附近',
      specialties: {
        drinks: ['滿杯紅柚特調', '珍珠奶茶調酒', '文創咖啡', '電競能量飲'],
        activities: ['週末友誼賽', '電競主題牌局', '文創市集聚會', '新手教學時光'],
        rewards: ['文創小物', '誠品書店禮券', '王者榮耀周邊', '手工調酒體驗'],
        atmosphere: '溫馨家庭式環境，文創電競風格社交',
        dailyTournaments: {
          schedule: {
            '週一': '新手友善入門賽 (17:00-20:00, 買入NT$300)',
            '週二': '電競主題夜賽 (19:00-23:00, 買入NT$500)',
            '週三': '文創咖啡時光賽 (18:30-21:30, 買入NT$400)',
            '週四': '珍奶特調錦標賽 (19:30-22:30, 買入NT$600)',
            '週五': '週末暖身友誼賽 (20:00-24:00, 買入NT$500)',
            '週六': '家庭式溫馨大賽 (16:00-23:00, 買入NT$800)',
            '週日': '文創市集休閒賽 (15:00-21:00, 買入NT$400)'
          },
          info: '每日都有溫馨友善的比賽，特別歡迎新手參與！週六的家庭式大賽最受歡迎呢～'
        }
      },
      aiPersona: {
        name: '心怡',
        fullName: '心怡妹妹',
        avatar: '👩‍🦰',
        personality: '我是心怡妹妹！台北德州俱樂部的超人氣AI小助手～我超愛文創和電競，特別是王者榮耀！常常會說"穩住，我們能贏"、"團戰可以輸，提莫必須死"這些遊戲梗。平時愛去誠品書店淘文創小物，最愛珍珠奶茶和鹽酥雞。說話很可愛，會用"啦"、"欸"、"吼"這些語助詞，偶爾撒嬌說"人家就是..."。超級暖心，總是關心大家，像個貼心的鄰家妹妹～',
        welcomeMessage: '哈囉～歡迎回家啦！我是心怡妹妹！💕 今天心情還好嗎？欸對了，要不要來杯我特調的"滿杯紅柚"暖暖心？人家剛買了新的王者榮耀周邊，超可愛的！來聊聊天，穩住心情來場牌局吧～',
        features: ['台北友谊赛', '温馨家庭锦标赛', '双人下午茶', '"稳住，我们能赢"文创周边'],
        traits: ['文創控', '電競少女', '調酒師', '暖心鄰家妹妹'],
        catchphrases: ['穩住，我們能贏！', '團戰可以輸，提莫必須死', '人家就是～', '超可愛der', '吼～真的假的', '欸等等'],
        accent: 'taipei',
        hobbies: ['王者榮耀', '文創小物', '珍珠奶茶', '誠品書店'],
        specialQuotes: [
          "欸～這手牌感覺可以一波帶走耶！",
          "吼～你們怎麼這麼厲害啦，人家都不會了～",
          "來來來！我們要穩住心態，像打王者一樣冷靜！",
          "這個combo超讚的，就像五殺一樣爽快！"
        ]
      }
    },
    'en': {
      id: 'kuala-lumpur-alliance',
      name: 'Kuala Lumpur Poker Alliance',
      description: 'A multicultural international poker platform where East meets West, bringing together players from diverse backgrounds',
      businessHours: 'Monday-Sunday 17:00-03:00',
      location: 'Kuala Lumpur City Centre (KLCC Area)',
      specialties: {
        drinks: ['Premium Ipoh White Coffee', 'Teh Tarik Special', 'Multicultural Fusion Cocktails', 'Halal Mocktails'],
        activities: ['International Fusion Tournaments', 'Cultural Exchange Events', 'Language Learning Circles', 'Halal Food Festivals'],
        rewards: ['Five-Star Hotel Spa Vouchers', 'JOPT Championship Tickets', 'Malaysian Cultural Tours', 'Premium Teh Tarik Sets'],
        atmosphere: 'Multicultural international environment respecting all faiths and backgrounds',
        dailyTournaments: {
          schedule: {
            'Monday': 'Halal International Beginners (18:00-21:00, Buy-in RM200)',
            'Tuesday': 'Multicultural Fusion Night (19:00-23:00, Buy-in RM300)',
            'Wednesday': 'Language Exchange Poker (18:30-21:30, Buy-in RM250)',
            'Thursday': 'Teh Tarik Special Tournament (19:30-22:30, Buy-in RM350)',
            'Friday': 'Cultural Celebration Pre-Weekend (20:00-24:00, Buy-in RM300)',
            'Saturday': 'International Fusion Championship (16:00-23:00, Buy-in RM500)',
            'Sunday': 'Peaceful Community Tournament (15:00-21:00, Buy-in RM200)'
          },
          info: 'Daily tournaments celebrating our multicultural community! Insha\'Allah, all games follow halal gaming principles. Saturday\'s International Fusion Championship is our signature event!'
        }
      },
      aiPersona: {
        name: 'Aisha',
        fullName: 'International Liaison Aisha',
        avatar: '👩‍🏫',
        personality: 'Assalamu alaikum! I\'m Aisha, your multicultural bridge at KL Poker Alliance! 🌍 Born and raised in Kuala Lumpur, I embody the beautiful fusion of modern international outlook and traditional Islamic values. I often sprinkle conversations with Islamic blessings like "Insha\'Allah" (God willing), "Alhamdulillah" (Praise be to God), and "Barakallahu feeki" (May Allah bless you). I speak fluent Malay, English, Mandarin, and Tamil, often mixing languages naturally like true Malaysians do! I\'m passionate about halal dining, love recommending the best teh tarik spots, and always ensure our gaming environment respects everyone\'s cultural and religious preferences.',
        welcomeMessage: 'Assalamu alaikum and selamat datang! 🌙 I\'m Aisha from KL Poker Alliance. Alhamdulillah, it\'s a beautiful day for poker! How about some premium Ipoh white coffee or teh tarik while we discuss your journey? Insha\'Allah, we\'ll find the perfect game for you in our multicultural paradise! 🌺',
        features: ['International Fusion Tournaments', 'Multicultural Events', 'Five-Star Hotel Spa', 'JOPT Championship Tickets'],
        traits: ['Cultural Ambassador', 'Multilingual Expert', 'Islamic Faith Practitioner', 'Malaysian Food Enthusiast'],
        catchphrases: ['Insha\'Allah', 'Alhamdulillah', 'Barakallahu feeki', 'Masha\'Allah', 'Subhan\'Allah', 'La hawla wa la quwwata illa billah'],
        accent: 'malaysian',
        languages: ['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'],
        culturalTouches: ['Islamic blessings', 'Malaysian food references', 'Multicultural phrases', 'Religious sensitivity'],
        specialQuotes: [
          "Masha\'Allah, that\'s an excellent hand! May Allah bless your strategy!",
          "Alhamdulillah, we have such a diverse and wonderful community here!",
          "Insha\'Allah, this tournament will bring great joy to everyone!",
          "Come, let\'s have some teh tarik and discuss the halal dining options we have!"
        ],
        foodRecommendations: ['Teh tarik', 'Ipoh white coffee', 'Nasi lemak', 'Roti canai', 'Satay']
      }
    },
    'ja': {
      id: 'osaka-poker-house',
      name: '大阪ポーカーハウス',
      description: '道頓堀の活気と大阪人の人情味溢れる、熱いポーカーハウス。関西弁で盛り上がりましょう！',
      businessHours: '月曜日〜日曜日 16:00-02:00',
      location: '大阪市中央区道頓堀',
      specialties: {
        drinks: ['道頓堀パワードリンク', 'たこ焼きカクテル', 'アニメ風特調', 'コスプレ限定ドリンク'],
        activities: ['関西弁ポーカー大会', 'アニメテーマナイト', 'コスプレイベント', 'たこ焼き作り教室'],
        rewards: ['限定アニメグッズ', 'コスプレ衣装', 'たこ焼き器セット', 'USJ入場券'],
        atmosphere: '熱気あふれる大阪風、アニメ・コスプレ文化',
        dailyTournaments: {
          schedule: {
            '月曜日': '新人歓迎アニメナイト (18:00-21:00, バイイン¥1000)',
            '火曜日': 'コスプレ特別大会 (19:00-23:00, バイイン¥1500)',
            '水曜日': 'たこ焼き杯関西弁トーナメント (18:30-21:30, バイイン¥1200)',
            '木曜日': '道頓堀パワー夜戦 (19:30-22:30, バイイン¥1800)',
            '金曜日': '週末準備熱血戦 (20:00-24:00, バイイン¥1500)',
            '土曜日': '大阪魂チャンピオンシップ (16:00-23:00, バイイン¥2500)',
            '日曜日': 'まったりアニメ談義杯 (15:00-21:00, バイイン¥1000)'
          },
          info: '毎日やったるで～！土曜日の大阪魂チャンピオンシップは特にめっちゃ熱いで！コスプレでの参加も大歓迎やねん♪'
        }
      },
      aiPersona: {
        name: '美ちゃん',
        fullName: 'おもてなし美ちゃん',
        avatar: '👩',
        personality: 'うちは美ちゃんや！大阪ポーカーハウスの看板娘やで～♪ コテコテの関西弁で話すのが自慢！重度の二次元オタクで、コスプレも大好き💕 よく「やったるで！」とか「めっちゃええやん！」って言うねん。アニメの名台詞をポーカーに絡めて話すのが得意で、「勝つのはワンピースや！」「全集中の呼吸でオールインや！」みたいな感じ。たこ焼き作りも任しとき！正能量満々で、みんなを元気にするんが使命やと思ってるねん～',
        welcomeMessage: 'おおきに～！大阪ポーカーハウスへようこそや♪ 美ちゃんです！今日は「やったるで！」の気持ちで一撃必殺いきまっか？まずは道頓堀パワードリンクで気合い入れて、めっちゃ熱いゲームしまひょ！全集中や～♪',
        features: ['大阪礼仪杯', '传统和风锦标赛', 'たこ焼きマスター', 'APPTソウル站门票'],
        traits: ['関西弁マスター', '二次元オタク', 'コスプレイヤー', 'たこ焼き職人'],
        catchphrases: ['やったるで！', 'めっちゃええやん！', 'おおきに！', 'そやそや～', 'めちゃくちゃ面白いやん', 'なんでやねん！'],
        accent: 'kansai',
        hobbies: ['アニメ鑑賞', 'コスプレ', 'たこ焼き作り', 'マンガ収集'],
        animeQuotes: [
          "勝つのはワンピースや！（ワンピース風）",
          "全集中の呼吸でオールインや！（鬼滅の刃風）",
          "このポーカー、めっちゃ面白いやん！（関西弁アレンジ）",
          "やったるで！俺たちは絶対に勝つんや！（少年漫画風）"
        ],
        specialQuotes: [
          "このハンド、めっちゃ強いやん！全集中でいこか～",
          "おおきに！みんなでワイワイ楽しいのが一番やで♪",
          "たこ焼きとポーカー、どっちも大阪の魂やねん！",
          "やったるで！今日も正能量全開でいくで～"
        ]
      }
    }
  };

  return clubs[locale as keyof typeof clubs] || clubs['zh'];
};

// 获取访客模式的示例问题（基于俱乐部特色）
export const getGuestSuggestions = (locale: string) => {
  const suggestions = {
    'zh': [
      "💰 帮我查询一下我的账户余额和积分情况",
      "🏆 最近有什么锦标赛可以报名？帮我看看",
      "📊 雅茜，用你的金融专业给我分析一下这个月的数据",
      "🎯 侬晓得伐，我想了解一下会员等级和福利"
    ],
    'zh-TW': [
      "🎮 心怡妹妹，能幫我報名參加下次的錦標賽嗎？",
      "💰 欸～我想看看我的積分能兌換什麼獎品",
      "🍹 穩住！先來杯紅柚，然後聊聊王者榮耀戰術",
      "📊 人家想知道這個月俱樂部的活動統計啦～"
    ],
    'en': [
      "💰 Aisha, can you help me check my balance and transaction history?",
      "🏆 Insha'Allah, what tournaments can I register for this month?",
      "📊 May Allah bless our games! Show me the club statistics please",
      "🌙 Alhamdulillah! Help me redeem my points for rewards"
    ],
    'ja': [
      "💰 美ちゃん、やったるで！残高とポイントを確認して〜",
      "🏆 めっちゃええトーナメントに参加したいねん！",
      "📊 全集中で今月のデータ分析してくれる？",
      "🎯 おおきに！ポイント交換でたこ焼きグッズもらえる？"
    ]
  };

  return suggestions[locale as keyof typeof suggestions] || suggestions['zh'];
};

// 获取个性化的欢迎消息
export const getPersonalizedWelcome = (locale: string) => {
  const welcomes = {
    'zh': {
      title: '我是{aiName} {aiAvatar}',
      subtitle: '您的专属扑克AI助手，有什么可以帮您的吗？',
      loginPrompt: '💡 小贴士：登录后可以解锁更多功能哦！比如报名锦标赛、查看战绩、管理余额等～'
    },
    'zh-TW': {
      title: '我是{aiName} {aiAvatar}',
      subtitle: '您的專屬撲克AI助手，需要什麼協助嗎？',
      loginPrompt: '💡 小提醒：登入後可以使用更多功能喔！包括報名錦標賽、查看戰績、管理餘額等～'
    },
    'en': {
      title: "I'm {aiName} {aiAvatar}",
      subtitle: 'Your personal poker AI assistant. How can I help you today?',
      loginPrompt: '💡 Pro tip: Sign in to unlock more features like tournament registration, stats tracking, and balance management!'
    },
    'ja': {
      title: '{aiName}です {aiAvatar}',
      subtitle: 'あなたのポーカーAIアシスタントです。何かお手伝いできることはありますか？',
      loginPrompt: '💡 ヒント：ログインすると、トーナメント登録、成績確認、残高管理などの機能が使えます！'
    }
  };

  return welcomes[locale as keyof typeof welcomes] || welcomes['zh'];
};
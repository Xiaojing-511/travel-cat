/**
 * 旅行卡片模板
 *
 * 后续批量导入时，按此结构追加即可。系统会从这里随机抽取一次旅行。
 *
 * 字段说明：
 * - id           string  唯一标识，导入后不要改
 * - location     string  定位文案，页面展示为「定位：xxx」
 * - image        string  包内占位或尚未上云的本地路径，正式实拍请走云存储
 * - imageFileID  string  云存储 fileID，例如 cloud://.../travel-cards/dali-flower-01.png
 *                        相册优先用它；没有则回退 image，再没有用 mock.png
 * - journal      string  猫咪第一人称手记。短、克制、只写一个瞬间，不要介绍景点
 * - journal_detail string  画面描述，对应 trips.json，用于生成旅行图
 *
 * 示例：
 * {
 *   id: 'dock-01',
 *   location: '旧码头',
 *   image: '/images/trips/dock-01.png',
 *   journal: '木板是热的。我把肚皮贴上去，听下面的水响。'
 * }
 */
module.exports = [
  // =========================
  // 云南
  // =========================
  {
    id: "dali-lake-01",
    location: "云南·洱海边",
    image: "/images/trips/dali-lake-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dali-lake-01.png",
    journal: "风从湖上吹过来，把我的耳朵吹成了两片小旗子。",
  },
  {
    id: "dali-flower-01",
    location: "云南·大理",
    image: "/images/trips/dali-flower-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dali-flower-01.png",
    journal: "窗外有一团黄色的花。我闻了闻，没有家里的香。",
  },
  {
    id: "dali-courtyard-01",
    location: "云南·白墙小院",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dali-courtyard-01.png",
    journal: "下午有人在院子里晒衣服。床单飘起来的时候，我躲了一下。",
  },
  {
    id: "dali-goat-01",
    location: "云南·山坡",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dali-goat-01.png",
    journal: "遇到一只小羊。它一直盯着我，我也一直盯着它。",
  },
  {
    id: "lijiang-alley-01",
    location: "云南·丽江古巷",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/lijiang-alley-01.png",
    journal: "石板路有点凉。我踩着别人留下的脚印走了一小段。",
    journal_detail:
      "云南丽江古巷，雨后或清晨的真实街巷环境。青灰色石板路微微湿润，石缝里有苔藓，木门、旧墙和屋檐自然延伸，地面留着路人刚走过的浅浅湿脚印。旅行猫咪出现在画面右下偏中的位置，只露出一只前爪和半截小腿，爪子正踩在一个浅浅的脚印上，其他身体部分被老木门投下的阴影遮住。猫咪不看镜头。近景突出石板和爪子的触感，中远景保持古巷纵深，真实旅行摄影、冷静、安静、松弛。",
  },
  {
    id: "lijiang-river-01",
    location: "云南·小河边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/lijiang-river-01.png",
    journal: "水里有一片叶子，比我走得还快。",
    journal_detail:
      "云南乡间小河边。真实浅溪环境，午后自然光，清澈的水流从圆润石块之间缓慢经过，岸边有湿润草叶和少量落叶，一片黄褐色树叶顺着水流经过。旅行猫咪位于画面左侧岸边，只露出弯曲的尾巴、一只后腿和一点背部，身体藏在草丛后面，正在低头观察水里的叶子。尾巴自然弯曲，毛发真实，不看镜头。前景水草和石头形成自然遮挡，中景是叶子和水流，真实摄影、轻微浅景深、安静、好奇。",
  },
  {
    id: "shangri-la-sun-01",
    location: "云南·香格里拉",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/shangri-la-sun-01.png",
    journal: "太阳突然照到身上。我原本想继续走，后来改成趴着了。",
    journal_detail:
      "云南香格里拉，高原草地。真实自然环境，阳光从云层间突然照亮一块草地，周围仍有柔和阴影，远处是高原山丘和开阔天空，草叶随着微风轻轻摇动。旅行猫咪位于画面中央偏右的阳光区域，只露出完整背部、肩膀和一只后腿，身体已经从行走姿势自然变成趴卧，头部被前景草叶稍微遮住。猫咪不看镜头，阳光照出毛发细微轮廓。真实高原旅行摄影、自然光、松弛、温暖、略带慵懒。",
  },

  // =========================
  // 四川
  // =========================
  {
    id: "chengdu-alley-01",
    location: "四川·成都老巷",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chengdu-alley-01.png",
    journal: "门口趴着一只胖猫。它看起来比我更像这里的主人。",
    journal_detail:
      "四川成都老巷。真实的成都街巷，灰色墙面、旧木门、斑驳墙角和狭窄街道，午后光线柔和，一只体型微胖的本地花猫懒洋洋趴在店铺门口。旅行猫咪从画面右侧墙角后探出一点，只露出一只耳朵、半张侧脸和几根胡须，身体完全隐藏在墙后，正在偷偷观察花猫。花猫不看镜头，也没有夸张动作，两只猫保持自然距离。真实街头摄影、生活感、轻微幽默、安静。",
  },
  {
    id: "chengdu-teahouse-01",
    location: "四川·茶馆窗边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chengdu-teahouse-01.png",
    journal: "里面的人聊了很久。我没听懂，但茶香很好闻。",
    journal_detail:
      "四川成都传统茶馆窗边。真实木质窗框、竹椅、旧桌和玻璃茶壶，午后自然光从窗户照入，室内有人低声聊天，人物自然虚化，不突出面孔。一杯热茶放在桌上，茶汤透亮，有生活化的茶馆气息。旅行猫咪藏在画面左侧窗台下，只露出两只前爪搭在窗台边缘、半个额头和一只耳朵，头朝茶香飘来的方向，没有看镜头。前景窗框、中景茶杯、远处人影，真实摄影、安静、温暖。",
  },
  {
    id: "chengdu-panda-01",
    location: "四川·熊猫基地",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chengdu-panda-01.png",
    journal: "那只黑白家伙吃竹子吃得很认真。我有点佩服它。",
    journal_detail:
      "四川成都熊猫基地，真实竹林和动物活动区域。自然柔和日光穿过竹叶，一只大熊猫坐在竹林边专注啃竹子，身边散落着竹叶和竹竿。旅行猫咪藏在画面右侧木栈道栏杆后，只露出一小截尾巴、两只前爪和一点背部，身体大部分被栏杆和竹叶遮挡，正远远观察大熊猫。猫咪不看镜头，不成为画面主体。真实动物摄影、自然比例、真实毛发、安静、略带好奇和佩服的感觉。",
  },
  {
    id: "emeishan-mountain-01",
    location: "四川·峨眉山",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/emeishan-mountain-01.png",
    journal: "树上有只猴子抢走了一块面包。我觉得它很会挑时间。",
    journal_detail:
      "四川峨眉山山路。真实潮湿山林环境，粗糙树干、石阶、绿色苔藓和斑驳阳光，一只猕猴停在树旁或石阶边，手里拿着一小块面包。旅行猫咪位于画面右后方一块岩石后，只露出半张侧脸、一只耳朵和几根胡须，正在偷偷观察猴子。猫咪不看镜头，猴子也没有刻意摆姿势。前景叶片轻微虚化，中景动物，远处森林纵深，真实旅行抓拍、自然、有一点顽皮。",
  },
  {
    id: "jiuzhaigou-water-01",
    location: "四川·九寨沟",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/jiuzhaigou-water-01.png",
    journal: "水底的石头看起来像睡着了。我也差点一起睡着。",
    journal_detail:
      "四川九寨沟，清澈安静的湖边。真实透明的湖水可以看到水底圆润石头和细小水草，阳光穿过树林落在水面形成自然反光，周围森林安静。旅行猫咪趴在画面左侧木栈道边，只露出一只后爪、一小段尾巴和半块背部，尾巴自然垂落，身体处于慵懒休息状态。猫咪看向湖水而不是镜头。水面可有淡淡倒影，真实摄影、浅景深、安静、松弛。",
  },
  {
    id: "sichuan-rain-01",
    location: "四川·雨巷",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/sichuan-rain-01.png",
    journal: "雨停以后，瓦片一滴一滴地响。我坐在那里听了很久。",
    journal_detail:
      "四川老街雨后小巷。真实青瓦、灰墙、木门和湿润石板路，雨刚停，屋檐仍有一滴一滴的水落下来，水滴在地面形成很小的水花，路面带着自然反光。旅行猫咪坐在画面右侧屋檐下的旧木凳旁，只露出半个侧身、两只前爪和一小段尾巴，身体大部分藏在阴影里，安静地抬头听屋檐滴水。猫咪不看镜头，真实摄影、环境声感、安静、湿润、生活化。",
  },

  // =========================
  // 西藏
  // =========================
  {
    id: "lhasa-rooftop-01",
    location: "西藏·拉萨屋顶",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/lhasa-rooftop-01.png",
    journal: "太阳离我好近。我闭着眼睛，脸一直热热的。",
    journal_detail:
      "西藏拉萨老城区屋顶。真实高原建筑环境，白色墙面、平整屋顶和简单木结构，强烈但自然的高原阳光照亮一侧，天空通透湛蓝。旅行猫咪躺在画面右侧一块晒热的屋顶上，只露出半张闭着眼睛的侧脸、一只前爪和肩膀，身体自然蜷缩，脸朝向阳光，不看镜头。毛发边缘被阳光照亮，耳朵比例正常。前景屋顶纹理，中景猫咪局部，远处城市与天空，真实摄影、温暖、松弛。",
  },
  {
    id: "lhasa-street-01",
    location: "西藏·小街",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/lhasa-street-01.png",
    journal: "风里没有家里的味道。可是晒过太阳的墙，很像。",
    journal_detail:
      "西藏拉萨安静小街。真实土黄色或浅色墙面、旧门窗、狭窄街道和高原阳光，微风吹过空旷街巷，一面墙的向阳处被晒得温暖明亮。旅行猫咪从画面左侧墙角后慢慢走出，只露出背部、尾巴和一只后腿，背部被阳光勾勒出柔和轮廓，身体大部分仍藏在墙后。猫咪不看镜头，沿着温暖墙面向前走。真实街头摄影、克制、安静、带一点想家的感觉。",
  },
  {
    id: "namsto-lake-01",
    location: "西藏·纳木错",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/namsto-lake-01.png",
    journal: "湖一直望不到头。我决定不数了。",
    journal_detail:
      "西藏纳木错湖边。真实辽阔高原环境，开阔蓝色湖面、遥远雪山、低矮草坡与通透天空形成巨大的空间感，湖水只有细小波纹。旅行猫咪出现在画面右下远处，只露出两只后爪踩在湖边岩石上，身体和头部都在画面之外，没有成为主体。前景岩石带细节，中景猫爪与湖岸，远景大片湖面和天空。真实广角旅行摄影、极简、辽阔、安静、孤单但不孤独。",
  },
  {
    id: "snow-mountain-01",
    location: "西藏·雪山脚下",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/snow-mountain-01.png",
    journal: "雪光太亮了。我把眼睛眯起来，假装自己还在睡觉。",
    journal_detail:
      "西藏雪山脚下，真实高原雪地环境。洁白积雪、裸露岩石、低矮植物和通透蓝天，午间阳光照在雪面上形成自然反光。旅行猫咪躲在画面中央偏右的一块岩石后，只露出头顶、两只正常比例的耳朵和半闭的眼睛，眼睛被雪光照得微微眯起，身体大部分藏在岩石后。猫咪不看镜头，耳缘和面部短毛细节真实。自然摄影、明亮、安静、略带慵懒。",
  },

  // =========================
  // 新疆
  // =========================
  {
    id: "xinjiang-grassland-01",
    location: "新疆·草原",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xinjiang-grassland-01.png",
    journal: "草长得比我的肚皮还高。我走进去以后，就看不见自己的脚了。",
    journal_detail:
      "新疆辽阔草原，真实高原牧场环境，晴朗天空，大片高高的绿色草丛随风缓慢起伏，远处山丘延伸到天际。旅行猫咪隐藏在画面中央偏左的高草里，只露出两只正常比例的耳朵、鼻尖和几根胡须，耳朵随着风轻轻晃动，身体完全消失在草叶之间。猫咪不看镜头，草叶前后交错遮挡形成自然层次。真实广角旅行摄影、风感明显、自然、松弛、带一点探索感。",
  },
  {
    id: "xinjiang-lake-01",
    location: "新疆·赛里木湖",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xinjiang-lake-01.png",
    journal: "湖面安静得不像水。我偷偷伸了一只爪子过去。",
    journal_detail:
      "新疆赛里木湖湖边。真实清澈的蓝色湖水、浅色碎石岸边、远处雪山和草地，天空开阔，水面只有非常轻微的波纹。旅行猫咪位于画面左侧靠近湖水的位置，只露出一只前爪、半截前腿和一点胸口，另一部分身体被一块湖边岩石自然挡住，爪尖小心接近水面并形成一圈细小涟漪。猫咪不看镜头，重点表现水与猫爪的距离。真实摄影、自然光、安静、好奇。",
  },
  {
    id: "xinjiang-poplar-01",
    location: "新疆·胡杨林",
    image: "/images/trips/xinjiang-poplar-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xinjiang-poplar-01.png",
    journal: "风吹过树叶的时候，像好多只猫一起在说话。",
    journal_detail:
      "新疆胡杨林，真实秋季自然环境。金黄色胡杨叶被风吹得一起轻轻摇动，粗糙扭曲的树干形成天然纵深，暖色阳光从树冠间穿过，地面有少量落叶。旅行猫咪藏在画面右侧一棵胡杨树干后，只露出半边侧脸、一只耳朵和几根胡须，耳朵朝着树叶晃动的方向，像在听树林里的声音。身体大部分被树干遮住，不看镜头。真实摄影、自然光影、安静、温暖、微风感。",
  },
  {
    id: "xinjiang-sheep-01",
    location: "新疆·牧场",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xinjiang-sheep-01.png",
    journal: "一群羊从我面前经过。最后那只回头看了我一眼。",
    journal_detail:
      "新疆高原牧场。真实开阔草地、低矮山坡、木栅栏和辽阔天空，一群绵羊从画面前方横向慢慢经过，最后一只落后一点，正自然回头。旅行猫咪躲在画面左侧木栅栏后，只露出一小块背部、一只后腿和尾巴，身体被栅栏阴影部分遮挡，猫咪正安静看着羊群。最后一只羊的视线与猫咪方向自然形成呼应。真实动物摄影、自然光、开阔、安静、有一点偶遇感。",
  },
  {
    id: "turpan-grape-01",
    location: "新疆·葡萄架下",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/turpan-grape-01.png",
    journal: "葡萄一串一串挂在头顶。我抬头看得脖子有点酸。",
    journal_detail:
      "新疆吐鲁番葡萄架下。真实乡村庭院环境，茂密葡萄藤形成自然遮阳棚，一串串葡萄垂在头顶，阳光透过叶片形成细碎光斑，空气清凉安静。旅行猫咪位于画面右侧旧木椅旁，只露出抬起的头顶、两只耳朵和一小部分脖子，耳朵朝上，正在观察头顶的葡萄，身体被木椅和阴影遮住。猫咪不看镜头，保持真实比例。真实生活摄影、自然光、绿色树荫、轻松。",
  },
  {
    id: "kashgar-old-city-01",
    location: "新疆·喀什老城",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/kashgar-old-city-01.png",
    journal: "阳光爬过黄色的墙。我跟着它走了半条街。",
    journal_detail:
      "新疆喀什老城，真实街巷环境。温暖的黄色土墙、旧木门、屋檐和石板路，午后阳光缓慢从阴影移动到墙面，形成自然的光影交界。旅行猫咪位于画面最左侧靠墙的位置，只露出一条尾巴、一只后腿和一小块背部，身体大部分走出画面，尾巴仍留在阳光里，像正在追着光往前走。猫咪不看镜头。真实街头摄影、暖色自然光、生活感、安静。",
  },

  // =========================
  // 青海 / 甘肃
  // =========================
  {
    id: "qinghai-lake-01",
    location: "青海·青海湖",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/qinghai-lake-01.png",
    journal: "风很大。我把身体压低了一点，感觉自己更稳了。",
    journal_detail:
      "青海湖岸边，真实高原湖泊环境。天空开阔，湖水被大风吹起连续波纹，岸边草地向同一方向倾斜，远处湖面延伸到天际。旅行猫咪趴低在画面右侧前景一块岩石旁，只露出压低的背部、耳朵尖和尾巴根部，身体姿态明显贴近地面，耳朵向后顺着风压，毛发被风吹乱但保持真实。猫咪不看镜头。广角真实旅行摄影、风感、开阔、安静。",
  },
  {
    id: "chaka-salt-01",
    location: "青海·茶卡盐湖",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chaka-salt-01.png",
    journal: "地面亮得像水。我低头找了半天，没找到鱼。",
    journal_detail:
      "青海茶卡盐湖，真实盐地环境。白色盐层在自然阳光下明亮反光，远处有浅浅积水形成镜面效果，天空与地面延展开阔空间。旅行猫咪出现在画面左前方，只露出低头时的一只耳朵、鼻尖和一只前爪，前爪轻轻踩在盐地边缘，身体被画面外自然裁切。猫咪低头寻找水里的东西，没有看镜头。前景盐晶颗粒真实可见，中景反射地面，远景天空，真实摄影、安静、轻盈。",
  },
  {
    id: "dunhuang-desert-01",
    location: "甘肃·敦煌沙漠",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dunhuang-desert-01.png",
    journal: "沙子钻进了爪缝。我走了一会儿，决定原谅它。",
    journal_detail:
      "甘肃敦煌沙漠，真实细腻沙丘与荒漠环境，午后斜阳在沙丘表面形成连续阴影和纹理，空气干燥通透，远处没有其他人物。旅行猫咪位于画面中央偏左，只露出两只前爪和一点下腹部，爪子踩进柔软沙地，细沙附着在爪缝和毛发之间，身体其余部分被画面外自然裁切。猫咪没有看镜头。低机位近景突出沙粒质感，远处沙丘保持开阔感，真实旅行摄影、自然光、安静。",
  },
  {
    id: "dunhuang-crescent-01",
    location: "甘肃·月牙泉",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dunhuang-crescent-01.png",
    journal: "远远看见一弯水，像有人把月亮藏在沙子里。",
    journal_detail:
      "甘肃敦煌月牙泉，真实沙漠绿洲环境。金色沙丘从前景延伸到远处，一弯清澈的泉水被沙丘环抱，周围有少量真实植被和古建筑轮廓，午后自然光温暖柔和。旅行猫咪从画面右侧沙丘坡后探出一点，只露出半个侧身、两只耳朵和一小截尾巴，正朝月牙泉方向看，没有看镜头。前景沙纹细腻，中景猫咪局部，远景月牙泉和沙丘，真实广角摄影、宁静、辽阔。",
  },
  {
    id: "zhangye-rainbow-01",
    location: "甘肃·张掖",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/zhangye-rainbow-01.png",
    journal: "山是好多种颜色。我站着看，忘了自己本来要去哪。",
    journal_detail:
      "甘肃张掖彩色山地，真实丹霞地貌环境。红色、橙色、黄色和浅褐色山体自然层叠，纹理清晰，天空开阔，柔和日光从侧面照亮山脊。旅行猫咪站在画面左侧一块岩石后，只露出两只前爪、半个背部和尾巴尖，身体被岩石自然遮住，头部不进入画面，像站在那里安静看风景。真实广角旅行摄影、自然色彩、层次丰富、安静、开阔。",
  },

  // =========================
  // 陕西
  // =========================
  {
    id: "xian-wall-01",
    location: "陕西·西安城墙",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xian-wall-01.png",
    journal: "墙很高。我站在边上吹了一会儿风，觉得自己也很高。",
    journal_detail:
      "陕西西安古城墙，真实城墙环境。午后自然光照在厚重砖墙、垛口和宽阔城墙路面上，远处是城市建筑与天空，风从城墙上吹过。旅行猫咪位于画面右侧垛口附近，只露出一小块背部、两只耳朵和轻轻扬起的尾巴，身体被墙体遮挡，耳朵自然朝风的方向。猫咪面向远处城市而非镜头。真实旅行摄影、低机位、建筑纵深、自然光、安静、略带开阔感。",
  },
  {
    id: "xian-bell-01",
    location: "陕西·古城钟楼",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xian-bell-01.png",
    journal: "钟声突然响起来。我吓得尾巴竖了一下。",
    journal_detail:
      "陕西西安古城钟楼附近，真实历史街区环境，傍晚前的自然光，古建筑屋檐、砖石地面和街道行人形成生活化背景。远处钟楼庄重但不成为唯一主体。旅行猫咪位于画面左下角靠近石阶，只露出一截突然竖起的尾巴、两只后爪和一点背部，身体被石栏杆遮挡，姿态表现出刚被声音吓到的一瞬间。猫咪不看镜头。真实街头抓拍、自然景深、安静中带一点小趣味。",
  },
  {
    id: "xian-night-01",
    location: "陕西·夜市",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xian-night-01.png",
    journal: "到处都是香味。我决定先闻一遍，再决定想吃什么。",
    journal_detail:
      "陕西西安夜市，真实夜间街道环境，暖色摊位灯光照亮食物、桌面和石板路，人群自然经过，空气有生活烟火气。旅行猫咪蹲在画面右侧一家小吃摊旁的桌脚附近，只露出半张低头的侧脸、鼻尖、几根胡须和一只前爪，正在闻空气里的香味，身体被桌子自然遮挡。猫咪不看镜头。前景食物轻微虚化，中景猫咪局部，远处灯光形成柔和散景，真实夜景摄影、温暖、安静。",
  },

  // =========================
  // 北京
  // =========================
  {
    id: "beijing-hutong-01",
    location: "北京·胡同",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/beijing-hutong-01.png",
    journal: "一只鸽子走得比我还慢。我们并排走了一会儿。",
    journal_detail:
      "北京老胡同，真实生活化街巷环境，灰砖墙、旧院门、树影和窄窄的石板路，清晨或午后柔和自然光。一只灰白鸽子在路中央缓慢走着。旅行猫咪出现在画面右侧墙边，只露出侧身的一小块背部、一只耳朵和一只前爪，和鸽子保持并排前进的关系，身体大部分处于画面外。猫咪不看镜头，鸽子也保持自然姿态。低机位真实街头摄影、轻微景深、安静、生活化。",
  },
  {
    id: "beijing-rooftop-01",
    location: "北京·屋顶",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/beijing-rooftop-01.png",
    journal: "风把远处的声音带过来。有人在喊一只猫回家。",
    journal_detail:
      "北京老城区屋顶，真实居民建筑环境，傍晚前柔和自然光，灰瓦屋顶、低矮墙体、远处树木和城市建筑安静延伸。风吹过屋顶，远处街道隐约有人影。旅行猫咪趴在画面左侧矮墙后，只露出一只耳朵、一小段背部和尾巴尖，身体朝向远处街区，像在听远处有人喊猫回家。猫咪不看镜头。前景墙体轻微虚化，远景城市声音感，真实摄影、安静、略带想家的情绪。",
  },
  {
    id: "beijing-forbidden-01",
    location: "北京·红墙边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/beijing-forbidden-01.png",
    journal: "墙被太阳晒得暖暖的。我靠了一下，没有人赶我走。",
    journal_detail:
      "北京红墙边，真实古建筑街区环境，午后阳光照在大片红色宫墙和灰色地面上，墙体一侧形成温暖明亮的光影。旅行猫咪靠在画面右侧红墙底部，只露出一小块侧身、肩膀和一只前爪，身体贴着墙面，耳朵和脸部位于画面外或被阴影遮挡。猫咪不看镜头，重点表现晒热墙面的触感。真实建筑摄影、自然光、安静、温暖、生活化。",
  },
  {
    id: "beijing-snow-01",
    location: "北京·雪天",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/beijing-snow-01.png",
    journal: "第一片雪落在我鼻子上。我打了个喷嚏。",
    journal_detail:
      "北京冬日雪天，真实胡同或居民区小巷，薄雪覆盖灰砖地面、屋檐和树枝，天光柔和偏冷。一片新落的雪停在旅行猫咪的鼻尖附近。猫咪位于画面中央偏右的墙角，只露出半张低头的侧脸、一只耳朵和一小块肩膀，嘴鼻附近刚好有细小雪花，像刚打完喷嚏。身体其余部分被墙角遮挡，不看镜头。真实冬季摄影、自然雪感、安静、柔软。",
  },

  // =========================
  // 江南
  // =========================
  {
    id: "suzhou-garden-01",
    location: "江苏·苏州园林",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/suzhou-garden-01.png",
    journal: "窗子里还有一个窗子。我看了一会儿，还是没看懂。",
    journal_detail:
      "江苏苏州园林，真实古典园林环境，白墙、深色木窗、漏窗、太湖石和安静小径，午后柔和自然光在墙面留下细腻影子。旅行猫咪藏在画面右侧一块太湖石后，只露出两只耳朵、额头和一只前爪，正通过漏窗观察里面的一扇窗子，身体大部分被石头挡住。猫咪不看镜头。前景石头、中景猫咪局部、远处窗框形成层层框景，真实摄影、克制、安静、富有空间感。",
  },
  {
    id: "suzhou-bridge-01",
    location: "江苏·小桥",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/suzhou-bridge-01.png",
    journal: "桥下面有鱼。它们比我想象得要胖很多。",
    journal_detail:
      "江苏江南小桥，真实水乡环境，白墙黛瓦、小石桥、清浅河水和岸边绿植，午后自然光照在水面上。一群圆润的鱼在桥下缓慢游动，水面有轻微倒影。旅行猫咪趴在桥边画面左侧，只露出一只前爪、半个肩膀和低垂的尾巴，前爪靠近水面但没有碰水，身体被桥栏杆挡住。猫咪不看镜头，而是盯着水下的鱼。低机位真实摄影、自然景深、安静、有一点好奇。",
  },
  {
    id: "wuzhen-rain-01",
    location: "浙江·乌镇",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/wuzhen-rain-01.png",
    journal: "雨落在水里，又落在屋檐上。我分不清是哪一种声音更好听。",
    journal_detail:
      "浙江乌镇，真实雨后水乡环境，青瓦白墙、木窗、窄窄河道和石板路，细雨还在持续，水面被雨点敲出细碎涟漪，屋檐不断滴水。旅行猫咪坐在画面右侧一扇木门下，只露出两只前爪、半个侧身和尾巴尖，身体藏在屋檐阴影里，安静看着河面。猫咪不看镜头。前景雨丝轻微虚化，中景猫咪局部与河水，远处小桥，真实雨天摄影、安静、温柔。",
  },
  {
    id: "hangzhou-lake-01",
    location: "浙江·西湖边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/hangzhou-lake-01.png",
    journal: "船轻轻过去，水纹也跟着走。我伸爪子碰了一下。",
    journal_detail:
      "浙江杭州西湖边，真实湖岸环境，午后柔和阳光，湖面平静，一只小船缓缓经过，船尾留下连续扩散的水纹，岸边有柳树和自然草地。旅行猫咪藏在画面左侧湖边石栏后，只露出一只前爪、半截前腿和一点胸口，爪尖轻轻触碰水面形成细小涟漪，身体被石栏遮挡。猫咪不看镜头。真实摄影、浅景深、自然光、安静、好奇。",
  },
  {
    id: "hangzhou-tea-01",
    location: "浙江·茶山",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/hangzhou-tea-01.png",
    journal: "空气里有一股青涩的味道。和我小时候闻过的春天有点像。",
    journal_detail:
      "浙江杭州茶山，真实春季茶园环境，层层茶垄沿山坡展开，嫩绿色茶叶在柔和阳光下有细腻光泽，空气清新湿润。旅行猫咪出现在画面右侧茶垄之间，只露出半个背部、一只耳朵和一小段尾巴，身体被低矮茶树自然遮挡，猫咪低头靠近茶叶闻气味，没有看镜头。前景嫩叶清晰，中景猫咪局部，远处茶山层叠，真实旅行摄影、自然光、宁静、带一点春天的温度。",
  },

  // =========================
  // 上海
  // =========================
  {
    id: "shanghai-window-01",
    location: "上海·弄堂",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/shanghai-window-01.png",
    journal: "窗台晒着一床被子。我闻了一下，偷偷蹭了两下。",
    journal_detail:
      "上海老弄堂，真实居民区生活环境，午后阳光落在窄窄巷道、老窗台和晾晒被子上，一床浅色棉被被太阳晒得蓬松温暖。旅行猫咪从画面左侧窗台边探出一点，只露出半张侧脸、鼻尖、几根胡须和一只前爪，鼻尖靠近被角，身体被窗台和晾晒衣物遮挡，像偷偷蹭了两下。猫咪不看镜头。真实生活摄影、自然光、浅景深、温暖、安静。",
  },
  {
    id: "shanghai-bund-01",
    location: "上海·江边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/shanghai-bund-01.png",
    journal: "河对面亮了好多灯。我看了一会儿，觉得晚上也不坏。",
    journal_detail:
      "上海黄浦江边，真实城市江岸环境，蓝调时刻，远处高楼和建筑灯光逐渐亮起，江面反射细碎光点，风很轻。旅行猫咪趴在画面右侧栏杆附近，只露出一小块背部、两只耳朵和尾巴尖，身体大部分被栏杆下缘挡住，正面向江对岸灯光而不是镜头。前景栏杆轻微虚化，中景猫咪局部，远景城市夜景，真实城市旅行摄影、安静、克制、带一点陪伴感。",
  },
  {
    id: "shanghai-cat-01",
    location: "上海·街角",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/shanghai-cat-01.png",
    journal: "遇到一只橘猫。它没有理我，我也假装没有理它。",
    journal_detail:
      "上海老街街角，真实城市生活场景，旧墙、卷帘门、小商铺和路边自行车，午后光线柔和。一只橘猫懒洋洋趴在墙边阴影里。旅行猫咪位于画面右前方，仅露出一只后腿、一小截尾巴和半个背部，身体故意朝向另一边，像假装没看橘猫。两只猫保持自然距离，彼此视线不直对镜头。真实街头抓拍、自然光、略带幽默、松弛、生活感。",
  },
  {
    id: "shanghai-rain-01",
    location: "上海·雨夜",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/shanghai-rain-01.png",
    journal: "雨下得很密。我躲进屋檐下面，想起了我的窝。",
    journal_detail:
      "上海雨夜老街，真实城市街景，密集细雨打在石板路和屋檐上，路灯与商铺暖光在湿润地面形成自然倒影。旅行猫咪躲在画面左侧屋檐深处，只露出半个蜷缩的背部、一只耳朵和尾巴尖，身体尽量靠近墙角，像在寻找熟悉的安全感。猫咪不看镜头。前景雨滴与反光轻微虚化，中景猫咪局部，远景街道灯光，真实夜雨摄影、安静、温暖、带一点想家。",
  },

  // =========================
  // 福建
  // =========================
  {
    id: "xiamen-seaside-01",
    location: "福建·厦门海边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xiamen-seaside-01.png",
    journal: "有人在远处骑车。海风把他的衣角吹得一直往后跑。",
    journal_detail:
      "福建厦门海边，真实滨海步道环境，晴朗午后，自然阳光照在海面和岸边植物上，远处一名骑行者沿海边缓慢经过，衣角被海风向后吹起。旅行猫咪位于画面右侧靠近栏杆的低处，只露出尾巴、半截背部和一只前爪，身体被低矮草丛和栏杆遮挡，正望向远处骑车的人和海面，没有看镜头。真实旅行摄影、海风感、自然光、开阔、安静。",
  },
  {
    id: "xiamen-gulangyu-01",
    location: "福建·鼓浪屿",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/xiamen-gulangyu-01.png",
    journal: "巷子里有一扇蓝色的门。我绕进去以后，忘了原来的路。",
    journal_detail:
      "福建鼓浪屿老巷，真实街区环境，浅色老建筑、植物、石板小路和一扇褪色蓝色木门，下午自然光从建筑间照下来。旅行猫咪位于画面左侧蓝门旁，只露出一只前爪、一小块侧身和尾巴弯曲的末端，身体被门框和墙角遮挡，像刚绕进小巷又停下来观察。猫咪不看镜头。前景绿植虚化，中景猫咪局部，远处巷道形成纵深，真实旅行摄影、安静、轻微迷路感。",
  },
  {
    id: "quanzhou-temple-01",
    location: "福建·泉州古街",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quanzhou-temple-01.png",
    journal: "香火的味道飘过来。我打了个喷嚏，神仙应该不会介意。",
    journal_detail:
      "福建泉州古街，真实闽南街巷与传统建筑环境，午后自然光，红砖墙、旧门窗和寺庙屋檐自然出现在远景，空气里有淡淡香火烟雾。旅行猫咪位于画面右侧一根石柱后，只露出半张侧脸、鼻尖、几根胡须和一只耳朵，刚刚闻到香火气味，身体被石柱挡住。猫咪不看镜头，鼻尖附近姿态自然。真实街头摄影、生活感、安静、略带轻微幽默。",
  },

  // =========================
  // 广东
  // =========================
  {
    id: "guangzhou-morning-01",
    location: "广东·广州街头",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/guangzhou-morning-01.png",
    journal: "太阳还没完全出来，就有人已经开始忙了。我决定继续睡一会儿。",
    journal_detail:
      "广东广州清晨街头，真实老城区生活环境，天刚亮，店铺卷帘门陆续打开，早餐摊开始准备食物，街道湿润，晨光柔和。旅行猫咪藏在画面左侧一家店铺门槛旁，只露出半个蜷缩的背部、一只耳朵和前爪，身体缩成一小团，明显还想继续睡。猫咪不看镜头。远处人们已经开始忙碌，中近景保持安静。真实街头摄影、自然晨光、生活感、慵懒。",
  },
  {
    id: "guangzhou-river-01",
    location: "广东·珠江边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/guangzhou-river-01.png",
    journal: "江边很热。我找了一块阴影，把自己折成一小团。",
    journal_detail:
      "广东广州珠江边，真实城市滨江环境，午后阳光强烈，江面有细小反光，岸边树木投下一片凉爽阴影。旅行猫咪位于画面右侧树影下，只露出蜷缩的背部、尾巴绕在身体旁的一小段和一只后爪，整个身体被阴影和植物自然遮挡，像把自己折成一团休息。猫咪不看镜头。前景树叶，中景猫咪局部，远处珠江，真实摄影、自然光、闷热感与阴凉感并存。",
  },
  {
    id: "chaozhou-bridge-01",
    location: "广东·潮州",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chaozhou-bridge-01.png",
    journal: "桥上的风吹起来很舒服。我差点忘记回去了。",
    journal_detail:
      "广东潮州古城桥边，真实韩江与古城环境，傍晚前柔和自然光，古桥石栏、河面、远处老建筑和树木形成真实层次。旅行猫咪趴在画面左侧桥栏旁，只露出一只前爪、半个背部和尾巴尖，身体被石栏部分遮挡，毛发被舒服的微风轻轻吹动。猫咪朝河面和风来的方向看，不看镜头。真实旅行摄影、自然光、轻微风感、安静、松弛。",
  },

  // =========================
  // 广西
  // =========================
  {
    id: "guilin-river-01",
    location: "广西·漓江",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/guilin-river-01.png",
    journal: "船慢慢经过。我跟着它走了一段，后来船比我快。",
    journal_detail:
      "广西漓江边，真实喀斯特山水环境，清晨或午后柔和自然光，河面安静，小船缓慢划过，两岸是典型喀斯特山峰与绿色植被。旅行猫咪位于画面右侧河岸小路，只露出一只后腿、尾巴和一点背部，身体向前移动，像沿着河岸跟着船走了一小段。猫咪不看镜头，身体大部分被岸边草丛遮挡。真实广角旅行摄影、前景草叶、中景水面、远景山峰，安静、开阔。",
  },
  {
    id: "yangshuo-hill-01",
    location: "广西·阳朔",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/yangshuo-hill-01.png",
    journal: "山一座接一座，像好多只猫趴在远处。",
    journal_detail:
      "广西阳朔，真实喀斯特山地景观，晴朗午后，自然阳光照亮起伏山峰、稻田和乡间小路，空气通透。旅行猫咪位于画面左下方田埂边，只露出一只耳朵、半张侧脸和尾巴尖，身体被高草和田埂遮住，正望向远处一座座山峰，不看镜头。远处山形自然排列，形成像猫咪趴着一样的联想，但不要刻意拟人化。真实旅行摄影、自然景深、安静、轻松。",
  },
  {
    id: "longji-stairs-01",
    location: "广西·龙脊梯田",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/longji-stairs-01.png",
    journal: "台阶一层一层。我走累了，就坐下来数云。",
    journal_detail:
      "广西龙脊梯田，真实山地梯田环境，层层水田或绿田沿山坡延伸，柔和午后阳光照亮田埂，远处山谷和云层缓慢移动。旅行猫咪坐在画面右侧一段石阶旁，只露出半个背部、两只前爪和尾巴自然垂在台阶边缘，身体其他部分被石墙遮挡，头部朝天空方向，不看镜头。前景台阶纹理，中景猫咪局部，远景梯田和云层，真实摄影、安静、松弛。",
  },

  // =========================
  // 海南
  // =========================
  {
    id: "sanya-beach-01",
    location: "海南·三亚海边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/sanya-beach-01.png",
    journal: "浪把一只贝壳推到我脚边。我推回去了，它又回来了。",
    journal_detail:
      "海南三亚海边，真实热带海岸环境，柔和午后阳光，浅色细沙、透明海水和缓慢靠岸的浪花，海风轻吹。旅行猫咪位于画面右前方，只露出一只前爪、半截前腿和一点胸口，前爪轻轻碰着一只被海浪推来的贝壳，身体被画面外自然裁切。猫咪不看镜头，贝壳随着下一道浪又向前移动。低机位真实海边摄影、细沙纹理、自然光、安静、有一点可爱。",
  },
  {
    id: "hainan-palm-01",
    location: "海南·椰林",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/hainan-palm-01.png",
    journal: "树影一直摇。我躺在下面，看了很久。",
    journal_detail:
      "海南椰林，真实热带环境，午后阳光从高大的椰树叶片间穿过，在地面形成不断晃动的自然树影，周围是沙地、草丛和落叶。旅行猫咪躺在画面左侧树影下面，只露出侧身的一小部分、闭着的眼睛、一个耳朵和一只后爪，身体被低矮植物自然遮挡。猫咪面向树影而非镜头，毛发被斑驳阳光轻轻照亮。真实摄影、自然光、安静、慵懒、热带松弛感。",
  },

  // =========================
  // 贵州
  // =========================
  {
    id: "guizhou-village-01",
    location: "贵州·山间村寨",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/guizhou-village-01.png",
    journal: "屋檐下挂着很多辣椒。看起来有点凶，我没有靠近。",
    journal_detail:
      "贵州山间村寨，真实少数民族山村生活环境，木质房屋、石墙、屋檐和山地小路，午后自然光。屋檐下挂着一串串红辣椒，随着风轻轻摇动，颜色鲜明但保持真实。旅行猫咪躲在画面右侧一根木柱后，只露出两只耳朵、半个额头和一只前爪，身体明显和辣椒保持距离，正在小心观察。猫咪不看镜头。真实乡村摄影、自然光、生活感、轻微幽默、安静。",
  },
  {
    id: "huangguoshu-water-01",
    location: "贵州·瀑布边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/huangguoshu-water-01.png",
    journal: "水声特别大。我往后退了两步，又忍不住走回来。",
    journal_detail:
      "贵州瀑布附近真实自然环境，大片岩石、湿润植物和飞溅水雾，瀑布在远景强烈流动，但不过分夸张，柔和自然光穿过树叶。旅行猫咪位于画面左侧岩石后，只露出半个背部、一只后腿和尾巴，身体明显离瀑布较远，像刚往后退了两步又重新探出来。猫咪不看镜头，尾巴自然微微翘起。真实自然摄影、前景湿石、中景猫咪局部、远景瀑布，安静但有水声感。",
  },
  {
    id: "qianhu-miao-01",
    location: "贵州·苗寨夜色",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/qianhu-miao-01.png",
    journal: "好多窗子亮起来了。每一扇里面，应该都有故事吧。",
    journal_detail:
      "贵州西江苗寨夜色，真实山地村寨环境，木楼层层叠叠，天色刚暗下来，许多窗户和屋檐灯光逐渐亮起，山谷仍保留一点蓝色天光。旅行猫咪坐在画面右侧一段木栏后，只露出背部、一只耳朵和尾巴尖，身体朝向灯火通明的村寨，没有看镜头。前景木栏轻微虚化，中景猫咪局部，远处大量真实暖光窗户形成层次。真实夜景旅行摄影、安静、温暖、略带孤单但不孤独。",
  },

  // =========================
  // 重庆
  // =========================
  {
    id: "chongqing-stairs-01",
    location: "重庆·山城小路",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chongqing-stairs-01.png",
    journal: "刚走完一段楼梯，又看见一段。我怀疑这里没有平路。",
    journal_detail:
      "重庆山城老街，真实坡地城市环境，连续石阶、旧居民楼、斑驳墙面和错落平台层层展开，午后自然光从建筑之间落下来。旅行猫咪位于画面右侧一段楼梯转角，只露出后腿、尾巴和一小块背部，身体正准备继续向上走，前方又出现一段楼梯。猫咪不看镜头。前景台阶、中景猫咪局部、远处密集建筑形成明显空间层次，真实旅行摄影、自然光、生活感、略带趣味。",
  },
  {
    id: "chongqing-night-01",
    location: "重庆·江边夜色",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chongqing-night-01.png",
    journal: "灯映在水里，一直晃。我伸爪子捞了一下，什么也没有。",
    journal_detail:
      "重庆江边夜色，真实城市滨江环境，夜晚建筑灯光映在水面形成不断晃动的倒影，江风轻吹，岸边石阶和栏杆保持自然细节。旅行猫咪位于画面左侧江边阶梯，只露出一只前爪、半截前腿和一点胸口，爪尖靠近水面试探灯光倒影，身体被石栏遮挡。猫咪不看镜头，水面轻微泛起波纹。真实夜景摄影、自然反射、安静、有一点可爱。",
  },
  {
    id: "chongqing-cat-01",
    location: "重庆·街角屋檐",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/chongqing-cat-01.png",
    journal: "碰见一只花猫。它带我绕了一圈，然后自己回家了。",
    journal_detail:
      "重庆老街街角屋檐，真实山城居民区环境，斑驳墙面、旧屋檐、潮湿石板路和狭窄巷道，午后自然光。一只花猫在前方慢慢带路，经过屋檐转角。旅行猫咪出现在画面右侧后方，只露出一条尾巴、半个背部和一只后腿，身体被屋檐柱子遮挡，正跟着花猫走。花猫不看镜头，旅行猫咪也不看镜头。真实抓拍、不刻意居中、有空间纵深、安静、有一点短暂同行后的告别感。",
  },

  // =========================
  // 湖北 / 湖南
  // =========================
  {
    id: "wuhan-lake-01",
    location: "湖北·东湖边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/wuhan-lake-01.png",
    journal: "湖边的风很软。我在那里坐着，尾巴偶尔动一下。",
    journal_detail:
      "湖北武汉东湖边，真实湖岸环境，傍晚前柔和自然光，湖水安静，岸边草地和树木轻轻晃动，远处湖岸延伸开阔。旅行猫咪坐在画面左侧一块石头后，只露出尾巴、一小块背部和一只前爪，尾巴偶尔轻轻弯动，身体大部分藏在草丛里。猫咪面向湖面，不看镜头。前景草叶轻微虚化，中景猫咪局部，远景湖面和树影，真实摄影、安静、松弛。",
  },
  {
    id: "wuhan-bridge-01",
    location: "湖北·江边大桥",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/wuhan-bridge-01.png",
    journal: "桥上的车一辆接一辆。我数到二十六，就不想数了。",
    journal_detail:
      "湖北江边大桥，真实城市江岸环境，傍晚自然光，长桥横跨江面，车辆一辆接一辆经过，江水在桥下缓慢流动。旅行猫咪趴在画面右侧江堤栏杆后，只露出两只前爪、耳朵尖和一点额头，安静地看着桥上车流，没有看镜头。前景栏杆轻微虚化，中景猫咪局部，远景桥与车辆形成连续节奏。真实城市旅行摄影、自然光、安静、略带无聊的小趣味。",
  },
  {
    id: "zhangjiajie-cloud-01",
    location: "湖南·张家界",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/zhangjiajie-cloud-01.png",
    journal: "山从云里伸出来。我盯着看了一会儿，感觉它也在看我。",
    journal_detail:
      "湖南张家界，真实山岳云雾环境，石英砂岩山峰从薄薄云雾中向上伸出，绿色植被覆盖山体，柔和自然光，空气湿润。旅行猫咪位于画面左侧观景台岩石后，只露出半个侧身、一只耳朵和尾巴尖，身体朝向远处山峰，不看镜头。前景岩石形成遮挡，中景猫咪局部，远景高耸山峰与流动云雾，真实广角旅行摄影、安静、辽阔、略带奇妙感。",
  },
  {
    id: "fenghuang-river-01",
    location: "湖南·凤凰古城",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/fenghuang-river-01.png",
    journal: "河水慢慢流。灯亮起来以后，整条河都变得温柔了。",
    journal_detail:
      "湖南凤凰古城，真实沱江沿岸古建筑与木楼环境，傍晚蓝调时刻，屋檐灯光逐渐亮起，暖黄色灯光倒映在缓慢流动的河面上。旅行猫咪坐在画面右侧临河木栏后，只露出半个背部、一只耳朵和尾巴尖，身体朝河面和灯光方向，没有看镜头。前景木栏，中景猫咪局部与水面倒影，远处吊脚楼灯光，真实夜景摄影、温柔、安静、有陪伴感。",
  },

  // =========================
  // 山东
  // =========================
  {
    id: "qingdao-seaside-01",
    location: "山东·青岛海边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/qingdao-seaside-01.png",
    journal: "海水有点凉。我只让一只爪子碰到它。",
    journal_detail:
      "山东青岛海边，真实礁石海岸环境，阴晴交替的柔和自然光，蓝灰色海水缓慢拍打岸边礁石，海风轻吹。旅行猫咪位于画面右前方一块礁石后，只露出一只前爪、半截前腿和一点胸口，爪尖刚刚碰到浅水，其他身体部分被礁石遮住。猫咪低头看水面，不看镜头。前景礁石纹理真实，中景爪子与海水，远景海平线，真实旅行摄影、安静、自然、有一点试探感。",
  },
  {
    id: "qingdao-redroof-01",
    location: "山东·红瓦屋顶",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/qingdao-redroof-01.png",
    journal: "远处的屋顶都是红色的。我突然想起家里的小毯子。",
    journal_detail:
      "山东青岛老城区高处，真实红瓦屋顶与坡地城市景观，午后柔和阳光，密集的红色瓦顶、浅色建筑和蓝灰天空自然层叠。旅行猫咪位于画面左侧窗台或矮墙后，只露出背部、尾巴和一只耳朵，身体朝向远处一片片红瓦屋顶，没有看镜头。前景墙体和猫咪局部，中远景城市屋顶，真实摄影、自然光、安静、带一点淡淡的想家。",
  },
  {
    id: "taishan-dawn-01",
    location: "山东·泰山日出",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/taishan-dawn-01.png",
    journal: "天一点一点变亮。我缩成一团，没舍得闭眼。",
    journal_detail:
      "山东泰山山顶日出前后，真实高山环境，天空从深蓝慢慢变亮，远处山脊层层叠叠，第一束阳光落在岩石和云层边缘。旅行猫咪蜷缩在画面右侧一块山岩旁，只露出背部、两只耳朵和一只前爪，身体缩成小小一团，朝向日出的方向，不看镜头。前景山岩，中景猫咪局部，远景云海与晨光，真实摄影、自然光、安静、克制、温暖。",
  },

  // =========================
  // 东北
  // =========================
  {
    id: "harbin-snow-01",
    location: "黑龙江·哈尔滨",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/harbin-snow-01.png",
    journal: "踩下去会咯吱响的雪，我来回踩了五次。",
    journal_detail:
      "黑龙江哈尔滨冬日街区，真实雪地环境，厚实新雪覆盖街道、屋檐和树枝，冷色自然天光，地面脚印清晰。旅行猫咪位于画面中央偏左，只露出两只前爪、半截小腿和一点胸口，连续踩在松软积雪上，雪面形成几处新鲜爪印，身体被画面外自然裁切。猫咪低头看雪，不看镜头。近景突出雪粒与爪印，中远景是真实冬日街景，安静、清脆、轻松。",
  },
  {
    id: "harbin-window-01",
    location: "黑龙江·窗边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/harbin-window-01.png",
    journal: "屋里很暖，窗外很冷。我选了里面。",
    journal_detail:
      "黑龙江冬日室内窗边，真实温暖居住空间，窗外是积雪、结霜玻璃和冷色街景，室内有柔和自然光和一点暖色生活痕迹。旅行猫咪趴在窗台内侧，只露出背部、尾巴绕在身体旁的一小段和一只耳朵，身体朝向室内而不是窗外，像已经做出了选择。猫咪不看镜头。前景窗玻璃轻微虚化，中景猫咪局部，远景雪景，真实摄影、安静、温暖。",
  },
  {
    id: "changbai-mountain-01",
    location: "吉林·长白山",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/changbai-mountain-01.png",
    journal: "雪地上有一排很小的脚印。我跟着它走，最后它钻进树丛里了。",
    journal_detail:
      "吉林长白山冬季森林，真实雪地、针叶树和积雪枝叶，自然阴天或柔和晨光。一排细小动物脚印从画面前景穿过雪地，逐渐延伸到远处一片树林。旅行猫咪位于画面右侧树丛边，只露出尾巴、半个后腿和一只耳朵，身体正沿着脚印方向向树林走去，最后消失在树影里。猫咪不看镜头。前景脚印清晰，中景猫咪局部，远景森林，真实摄影、安静、探索感。",
  },
  {
    id: "snow-forest-01",
    location: "东北·雪林",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/snow-forest-01.png",
    journal: "树上落下来一小团雪，刚好砸在我的头上。",
    journal_detail:
      "东北冬季雪林，真实白桦或针叶树林，厚雪覆盖树枝，自然冷色天光透过树干。旅行猫咪位于画面左侧一棵树下，只露出头顶、两只耳朵和一小块肩膀，头顶刚好有一小团松雪落下，雪花轻轻散开。猫咪不看镜头，耳朵略微受惊但姿态自然。前景细雪虚化，中景猫咪局部，远景雪林，真实冬季摄影、安静、轻微顽皮。",
  },

  // =========================
  // 内蒙古
  // =========================
  {
    id: "inner-mongolia-grassland-01",
    location: "内蒙古·草原",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/inner-mongolia-grassland-01.png",
    journal: "草一直延伸到很远。我第一次觉得天空好像也变大了。",
    journal_detail:
      "内蒙古辽阔草原，真实自然牧场景观，大片绿色草地从前景一直延伸到远处起伏地平线，天空占据画面大部分，白云自然漂浮。旅行猫咪位于画面右下侧一片低草后，只露出两只耳朵、一小块背部和尾巴尖，身体很小，刻意不要成为主体。猫咪朝远处草原和天空看，没有看镜头。真实广角旅行摄影、巨大空间感、自然光、安静、孤单但不孤独。",
  },
  {
    id: "inner-mongolia-horse-01",
    location: "内蒙古·牧场",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/inner-mongolia-horse-01.png",
    journal: "那匹马低头看我。我抬头看它，脖子有点酸。",
    journal_detail:
      "内蒙古牧场，真实辽阔草原和牧场围栏环境，下午自然光，一匹棕色或深色马站在中景草地上，低头看向靠近脚边的旅行猫咪。旅行猫咪位于画面左下方，只露出抬头的一只耳朵、半张侧脸和一只前爪，身体大部分被高草挡住。猫咪不看镜头，而是仰头看马。马与猫比例真实，保持自然距离。低机位摄影、自然光、安静、有一点有趣的对视感。",
  },

  // =========================
  // 河南
  // =========================
  {
    id: "luoyang-peony-01",
    location: "河南·洛阳花丛",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/luoyang-peony-01.png",
    journal: "花比我的脸还大。我闻了一下，然后打了个喷嚏。",
    journal_detail:
      "河南洛阳春日牡丹花丛，真实花园环境，大片盛开的牡丹自然生长，柔和午后阳光照亮花瓣层次和绿叶。旅行猫咪藏在画面右侧花丛之间，只露出半张侧脸、鼻尖、一只耳朵和几根胡须，一朵较大的牡丹刚好靠近鼻尖，猫咪像刚闻完花准备打喷嚏。身体大部分被花叶遮挡，不看镜头。前景花瓣轻微虚化，中景猫咪局部，真实摄影、自然景深、柔软、略带可爱。",
  },
  {
    id: "songshan-mountain-01",
    location: "河南·嵩山",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/songshan-mountain-01.png",
    journal: "石头被太阳晒得暖暖的。我靠上去，暂时不想走了。",
    journal_detail:
      "河南嵩山山路，真实岩石、山林和古朴石阶环境，午后阳光照在一块裸露岩石上，岩石表面温暖明亮，周围仍有树荫。旅行猫咪靠在画面左侧岩石旁，只露出背部、肩膀和一只后腿，身体贴着晒热的石头休息，尾巴自然垂在地面。猫咪不看镜头。前景石头纹理清晰，中景猫咪局部，远景山路和树木，真实旅行摄影、安静、松弛、温暖。",
  },

  // =========================
  // 安徽
  // =========================
  {
    id: "huangshan-cloud-01",
    location: "安徽·黄山",
    image: "/images/trips/huangshan-cloud-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/huangshan-cloud-01.png",
    journal: "云从脚下过去。我低头看了一眼，突然觉得自己会飞。",
    journal_detail:
      "安徽黄山山顶，真实黄山奇松、花岗岩山峰与云海环境，清晨或午后自然光，白色云雾在群峰之间缓慢流动，云层仿佛就在脚下，远处山峰从云里露出。旅行猫咪位于画面右侧岩石边缘，只露出两只耳朵、半个头顶和一只前爪，身体大部分在岩石后方，低头朝脚下云海看，不看镜头。耳朵保持正常三角形比例，耳内细毛真实，微风轻轻吹动耳缘。真实广角旅行摄影、辽阔、轻盈、安静。",
  },
  {
    id: "hongcun-rain-01",
    location: "安徽·宏村",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/hongcun-rain-01.png",
    journal: "雨落在屋檐上，一串接一串。我趴在那里听了一下午。",
    journal_detail:
      "安徽宏村，真实徽派古村落雨天环境，白墙黑瓦、木门、窄巷与浅浅水渠，屋檐上的雨水连续落下，石板路湿润发亮。旅行猫咪趴在画面右侧一段木门槛旁，只露出半个背部、一只耳朵和尾巴尖，身体蜷缩在屋檐遮雨处，安静听着滴水，没有看镜头。前景屋檐雨滴自然虚化，中景猫咪局部，远处白墙黑瓦，真实雨天旅行摄影、安静、温柔、松弛。",
  },

  // =========================
  // 江西
  // =========================
  {
    id: "wuyuan-flower-01",
    location: "江西·婺源",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/wuyuan-flower-01.png",
    journal: "山坡上的花一起晃。我走过去，它们又一起晃回来。",
    journal_detail:
      "江西婺源春日山坡，真实乡野环境，绿色山坡与成片自然野花铺展开来，柔和午后阳光照亮花瓣，微风吹过时大片花朵向同一个方向轻轻摇晃。旅行猫咪位于画面右侧花丛之间，只露出一小块背部、一只耳朵和一只前爪，身体被花草自然遮挡，正从花丛边走过。猫咪不看镜头，猫咪经过后花朵重新被风吹回来。真实旅行摄影、自然光、轻微动态感、柔软、安静。",
  },
  {
    id: "jingdezhen-pottery-01",
    location: "江西·陶瓷小镇",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/jingdezhen-pottery-01.png",
    journal: "有人把一个圆圆的东西放在桌上。我绕着它看了三圈。",
    journal_detail:
      "江西景德镇陶瓷小镇，真实陶瓷作坊或小店环境，旧木桌、白色瓷器、陶土痕迹和自然窗光，空气安静，有真实手工生活感。桌面中央放着一个圆润素净的陶瓷坯体。旅行猫咪从画面左侧桌脚旁探出，只露出一只耳朵、半张侧脸、几根胡须和一只前爪，正绕着桌角观察陶器，不看镜头。前景桌面和陶器清晰，中景猫咪局部，真实纪实摄影、自然光、安静、好奇。",
  },

  // =========================
  // 福建 / 四川 / 广域旅行
  // =========================
  {
    id: "night-train-01",
    location: "夜行列车",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/night-train-01.png",
    journal: "窗外一直在往后跑。我靠着窗睡了一觉，醒来以后天亮了。",
    journal_detail:
      "中国夜行列车车厢，真实旅行环境，夜色从车窗外快速后退，远处灯光形成自然拖影，车厢内部安静，窗边有柔和顶灯。旅行猫咪蜷缩在画面右侧窗台或座椅边，只露出背部、尾巴和一只耳朵，身体靠着窗边睡着，脸部不出现或背向镜头。画面通过车窗反射表现移动感，随后远处天空已经开始变亮。真实纪实旅行摄影、低光、安静、孤单但不孤独。",
  },
  {
    id: "mountain-road-01",
    location: "山间公路",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/mountain-road-01.png",
    journal: "车开得很慢。路边的小树一棵一棵往后退。",
    journal_detail:
      "中国山间公路，真实弯曲山路与乡野环境，车辆缓慢行驶，车窗外小树、草坡和远山随着道路逐渐向后移动，天气晴朗，午后自然光。旅行猫咪位于车窗下方画面左侧，只露出一只耳朵、半个背部和一只前爪，身体趴在座椅边缘，正透过窗户观察外面的树木，不看镜头。前景车窗边缘、中景猫咪局部、远景山路形成自然层次，真实旅途抓拍、安静、松弛。",
  },

  // =========================
  // 猫咪想家
  // =========================
  {
    id: "miss-home-01",
    location: "陌生城市的夜晚",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/miss-home-01.png",
    journal: "今天没有遇到特别的事情。只是突然想睡家里的那块垫子。",
    journal_detail:
      "陌生城市的夜晚，真实安静街区，路灯照亮人行道、窗户和墙面，远处偶尔有人经过，环境并不热闹。旅行猫咪蜷缩在画面右侧一家旅馆或店铺门廊的角落，只露出背部、尾巴绕在身体旁的一小段和一只耳朵，身体缩成熟悉的睡姿，像在想念自己的垫子。猫咪不看镜头。前景路灯光斑，中景猫咪局部，远处城市灯光，真实夜景摄影、安静、孤单但不孤独。",
  },
  {
    id: "miss-home-02",
    location: "旅馆窗台",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/miss-home-02.png",
    journal: "窗外的灯很好看。看了一会儿，我还是想回家。",
    journal_detail:
      "陌生城市旅馆窗边，真实住宿环境，夜晚城市灯光通过窗户形成自然散景，玻璃上有轻微反射，室内保持安静。旅行猫咪坐在画面左侧窗台，只露出背部、后脑勺、两只耳朵和尾巴尖，身体朝向窗外城市，而不是镜头，耳朵自然竖起。窗外灯光柔和，不过度梦幻。前景窗框，中景猫咪局部，远景城市夜灯，真实夜景摄影、克制、安静、带一点想家。",
  },
  {
    id: "miss-home-03",
    location: "远方的小镇",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/miss-home-03.png",
    journal: "今天闻到一股很像家的味道。我追过去，却不是那里。",
    journal_detail:
      "陌生小镇街道，真实生活环境，午后自然光，旧房屋、木门、小店和窄窄街巷，空气安静。旅行猫咪从画面右侧向前走，只露出尾巴、后腿和一点背部，鼻子和头部已经朝着前方的气味来源探过去，身体被墙角自然遮挡。远处是一家普通的小店或厨房，飘来食物香气，但没有文字招牌。猫咪不看镜头。真实旅行街拍、自然光、轻微追寻感、安静、带一点失落。",
  },
  {
    id: "miss-home-04",
    location: "回程路上",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/miss-home-04.png",
    journal: "东西都收好了。我在门口坐了一会儿，突然有点舍不得。",
    journal_detail:
      "旅途回程前的住宿门口，真实小旅馆或民居环境，傍晚自然光，简单行李放在门边，门外是安静街道。旅行猫咪坐在画面左侧门槛附近，只露出半个背部、两只前爪和尾巴自然绕在身旁，身体朝向即将离开的街道，不看镜头。门框形成自然前景遮挡，行李只是环境的一部分，不突出。真实旅行纪实摄影、温暖自然光、安静、略带舍不得离开的情绪。",
  },
  {
    id: "miss-home-05",
    location: "清晨车站",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/miss-home-05.png",
    journal: "天刚刚亮。我想，回去以后要先吃东西，再睡一整天。",
    journal_detail:
      "清晨小火车站，真实中国小站环境，天刚亮，站台、铁轨、旧候车设施和稀少人影被柔和晨光照亮，空气安静。旅行猫咪位于画面右侧长椅下方，只露出一只前爪、半个背部和尾巴尖，身体趴着休息，像已经累得不想走了。猫咪朝向列车或站台，不看镜头。前景长椅、中景猫咪局部、远处晨光与铁轨，真实旅行纪实摄影、安静、松弛、回程感。",
  },

  // =========================
  // 和其他小动物相遇
  // =========================
  {
    id: "animal-dog-01",
    location: "河边草地",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-dog-01.png",
    journal: "今天遇到一只狗。它朝我叫，真没礼貌。",
    journal_detail:
      "河边草地，真实乡野河岸环境，午后自然光，绿色草地、浅水河流和远处树木自然展开。一只狗站在中景草地上，身体朝向旅行猫咪并自然张嘴吠叫，但不夸张。旅行猫咪藏在画面右侧一块石头后，只露出一只耳朵、半张侧脸和尾巴，身体明显保持距离，耳朵略微向后，不看镜头。前景草叶形成遮挡，中景两种动物形成自然互动，真实动物摄影、安静、略带幽默。",
  },
  {
    id: "animal-bird-01",
    location: "屋檐下面",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-bird-01.png",
    journal: "一只麻雀跳到离我很近的地方。它没跑，我也没动。",
    journal_detail:
      "老房子屋檐下面，真实安静生活环境，灰墙、木门、石板地面和柔和午后自然光。一只麻雀停在离地面很近的位置，轻轻跳动但没有飞走。旅行猫咪趴在画面左侧阴影里，只露出一只前爪、两只耳朵和一点鼻尖，身体完全藏在门槛后，保持静止观察。猫咪不看镜头，麻雀也不看镜头。浅景深、自然光、安静、克制、真实生活感。",
  },
  {
    id: "animal-butterfly-01",
    location: "山野花间",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-butterfly-01.png",
    journal: "蝴蝶停在我的鼻子前。我屏住呼吸，它才没有飞走。",
    journal_detail:
      "山野花间，真实春日自然环境，野花、青草和柔和阳光构成自然前景，一只蝴蝶轻轻停在旅行猫咪鼻尖前方。旅行猫咪位于画面右侧花丛中，只露出半张侧脸、鼻尖、几根胡须和一只耳朵，身体大部分被花草遮挡，保持安静没有扑动。猫咪的目光朝蝴蝶方向，不看镜头。前景花瓣轻微虚化，中景猫咪和蝴蝶清晰，真实微距感摄影、安静、柔软。",
  },
  {
    id: "animal-turtle-01",
    location: "池塘边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-turtle-01.png",
    journal: "有只乌龟走得很慢。我等了它一下。",
    journal_detail:
      "乡间池塘边，真实安静环境，浅水、湿润泥土、浮萍和岸边青草，柔和午后自然光。一只小乌龟沿着池塘边缓慢爬行。旅行猫咪位于画面左侧草丛后，只露出两只前爪、半个胸口和尾巴尖，身体停下来等待乌龟，姿态放松，没有催促。猫咪不看镜头，而是低头看乌龟。低机位真实动物摄影、自然景深、安静、温和、带一点陪伴感。",
  },
  {
    id: "animal-rabbit-01",
    location: "草地深处",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-rabbit-01.png",
    journal: "草丛里突然跳出一只兔子。它跑得比我想象中快很多。",
    journal_detail:
      "开阔草地深处，真实野外环境，午后自然光，青草高低错落，远处有树丛。一只兔子刚从草丛中快速穿过，身体处于自然奔跑姿态。旅行猫咪藏在画面右侧高草中，只露出一只耳朵、半张侧脸和一小块背部，目光追着兔子移动，不看镜头。部分草叶被兔子经过带动，形成轻微动态。真实自然摄影、抓拍感、浅景深、安静中带一点突然的趣味。",
  },
  {
    id: "animal-goose-01",
    location: "湖边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/animal-goose-01.png",
    journal: "一只鹅从我面前经过。我决定绕远一点。",
    journal_detail:
      "湖边草地，真实乡野环境，平静湖面、湿润泥地和自然草丛，午后阳光。一只白鹅沿湖岸从前景横向经过，身体高大而自然。旅行猫咪退到画面左侧一块石头后，只露出一只前爪、半截尾巴和一小块背部，身体与鹅保持明显距离，姿态像正在准备绕开它。猫咪不看镜头，鹅也不需要看镜头。真实动物旅行摄影、自然光、生活感、轻微幽默。",
  },

  // =========================
  // 标志性建筑 / 地标，但仍保持猫视角
  // =========================
  {
    id: "landmark-great-wall-01",
    location: "北京·长城",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/landmark-great-wall-01.png",
    journal: "路一直往前。我走了一小段，回头的时候已经看不到出发的地方了。",
    journal_detail:
      "北京长城，真实古长城山脊环境，晴朗或薄云天气，古老砖墙沿山势蜿蜒向远方，石阶高低起伏，周围山林自然分布。旅行猫咪位于画面右侧城墙垛口附近，只露出一只后腿、尾巴和一小块背部，身体已经继续向前走，回望方向位于画面外。猫咪不看镜头。前景砖石纹理，中景猫咪局部，远景长城连续山脊形成深远空间。真实广角旅行摄影、开阔、安静、轻微旅途感。",
  },
  {
    id: "landmark-bund-01",
    location: "上海·外滩",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/landmark-bund-01.png",
    journal: "楼都很高。我抬头看了很久，脖子有点累。",
    journal_detail:
      "上海外滩，真实城市建筑与江岸环境，晴朗午后自然光，高层建筑与历史建筑向上延伸，天空占据画面较大部分。旅行猫咪位于画面左下侧栏杆附近，只露出抬头的一只耳朵、鼻尖和一只前爪，身体被栏杆下缘挡住，视线朝高楼上方，不看镜头。低机位强调建筑高度，前景栏杆、中景猫咪局部、远景建筑，真实城市旅行摄影、开阔、自然、轻微幽默。",
  },
  {
    id: "landmark-west-lake-01",
    location: "杭州·湖边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/landmark-west-lake-01.png",
    journal: "桥的影子落在水里。我从影子上走过去了。",
    journal_detail:
      "杭州西湖边，真实湖岸、石桥和树木环境，午后柔和阳光，一座小桥的倒影清晰落在平静水面上，水纹缓慢扩散。旅行猫咪位于画面右侧湖岸，只露出四只爪子中的一只前爪、半截后腿和尾巴尖，正在靠近水边经过桥影，身体其余部分被岸边草丛自然遮挡。猫咪不看镜头。前景水草，中景倒影与爪子，远景石桥，真实摄影、安静、轻盈。",
  },
  {
    id: "landmark-potala-01",
    location: "西藏·拉萨",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/landmark-potala-01.png",
    journal: "那座白色的房子站得很高。我坐在下面看了很久。",
    journal_detail:
      "西藏拉萨，真实城市与高原建筑环境，远处白色高耸建筑依山而立，天空通透，阳光干净明亮，前景是普通街道、石墙或空地。旅行猫咪坐在画面左侧矮墙后，只露出背部、两只耳朵和尾巴尖，身体很小，正仰头看远处高大的建筑，不看镜头。让建筑成为环境主体而不是猫咪。真实广角旅行摄影、自然光、尺度感强、安静、辽阔。",
  },
  {
    id: "landmark-pagoda-01",
    location: "云南·大理古城",
    image: "/images/trips/landmark-pagoda-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/landmark-pagoda-01.png",
    journal: "远处有一座塔。我走了好久，它还是在那里。",
    journal_detail:
      "云南大理古城，真实街巷环境，白墙灰瓦、石板路、树影和远处古塔自然形成纵深，午后阳光柔和。旅行猫咪位于画面右侧巷道转角，只露出尾巴、半个背部和一只后腿，正沿石板路向前走，远处古塔始终位于视线尽头。猫咪不看镜头。前景墙角和绿植轻微虚化，中景猫咪局部，远景古塔，真实旅行摄影、自然光、安静、有长途步行的感觉。",
  },

  // =========================
  // 非地名型治愈卡
  // =========================
  {
    id: "quiet-sun-01",
    location: "路边的长椅",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-sun-01.png",
    journal: "太阳落下来一点，我也跟着换了个位置。",
    journal_detail:
      "安静的路边长椅，真实城市公园或街边环境，午后阳光随着时间缓慢移动，长椅一侧出现温暖光斑，另一侧仍在树影中，周围有草地、落叶和远处散步的人影。旅行猫咪位于画面左侧长椅下面，只露出尾巴、一只前爪和半个背部，随着阳光变化刚刚换了一个位置。猫咪不看镜头，身体放松。真实生活摄影、自然光、静谧、松弛。",
  },
  {
    id: "quiet-shadow-01",
    location: "树下",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-shadow-01.png",
    journal: "树影一直晃。我伸爪子按住一块，当然没按住。",
    journal_detail:
      "安静树下，真实公园或乡野环境，午后阳光透过树叶形成不断移动的斑驳树影，地面有细小落叶和草地。旅行猫咪躺在画面右侧树影里，只露出一只前爪、半个侧身和一只耳朵，前爪伸向地面一块正在移动的树叶影子，身体被草丛自然遮挡。猫咪不看镜头。重点表现真实光影变化和爪子动作，真实摄影、自然光、安静、轻微幽默。",
  },
  {
    id: "quiet-window-01",
    location: "旅馆窗边",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-window-01.png",
    journal: "天亮得比我早。我醒来以后，窗外已经有人在走路了。",
    journal_detail:
      "清晨旅馆窗边，真实简洁室内环境，淡淡晨光从窗帘缝隙照进来，窗外街道已经有人缓慢经过，空气安静。旅行猫咪位于画面右侧窗台，只露出一只耳朵、半个后脑勺和一小段尾巴，刚从睡眠中醒来，正看向窗外，不看镜头。室内保留床铺、窗框等自然生活细节，不摆拍。真实室内旅行摄影、柔和晨光、安静、慵懒。",
  },
  {
    id: "quiet-food-01",
    location: "小店门口",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-food-01.png",
    journal: "闻到鱼汤的时候，我突然觉得旅行也没有那么辛苦。",
    journal_detail:
      "陌生小镇小店门口，真实街边生活环境，午后自然光，旧木门、简朴桌椅和刚出锅的食物冒着轻微热气，空气里有明显但自然的鱼汤香气。旅行猫咪藏在画面左侧店门边，只露出半张侧脸、鼻尖、几根胡须和一只前爪，身体被门框遮住，正朝热气飘来的方向闻味道，不看镜头。前景食物轻微虚化，中景猫咪局部，真实生活摄影、温暖、安静、治愈。",
  },
  {
    id: "quiet-pillow-01",
    location: "陌生房间",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-pillow-01.png",
    journal: "枕头不是我的味道。我踩了几下，还是勉强可以睡。",
    journal_detail:
      "陌生旅馆房间，真实简洁住宿环境，柔和自然光从窗边照进床铺，床单、枕头和木质家具都保持真实生活痕迹。旅行猫咪位于画面右侧床边，只露出两只前爪、半截前腿和一点胸口，正在踩揉陌生枕头，身体被被子边缘遮住。猫咪不看镜头，动作自然，爪子压出轻微褶皱。前景床品纹理，中景猫咪局部，真实室内摄影、自然光、安静、慵懒。",
  },
  {
    id: "quiet-sunset-01",
    location: "山边黄昏",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-sunset-01.png",
    journal: "太阳下去了。今天就先这样吧。",
    journal_detail:
      "山边黄昏，真实自然山地环境，太阳已经接近地平线，天空由暖色渐渐变暗，远山形成柔和剪影，草地被最后一层夕阳照亮。旅行猫咪位于画面右侧一块岩石后，只露出背部、两只耳朵和尾巴尖，安静坐着看日落，不看镜头。猫咪体量很小，环境占绝大多数画面。真实广角旅行摄影、自然光、安静、克制、带一点结束一天的感觉。",
  },
  {
    id: "quiet-message-01",
    location: "旅途中的夜晚",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-message-01.png",
    journal: "有人好像在等我回去。我不知道她有没有想我。",
    journal_detail:
      "旅途中的安静夜晚，真实小镇或旅馆外部环境，路灯温暖，远处窗户有零散灯光，街道几乎没有人，空气安静。旅行猫咪位于画面左侧台阶边，只露出一小块背部、一个耳朵和尾巴尖，身体朝向远处亮着灯的窗户，不看镜头。前景石阶轻微虚化，中景猫咪局部，远处温暖窗光。真实夜景摄影、自然光源、安静、淡淡想家、孤单但不孤独。",
  },
  {
    id: "quiet-return-01",
    location: "回到熟悉的地方",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/quiet-return-01.png",
    journal: "闻到熟悉的味道以后，我知道自己到家了。",
    journal_detail:
      "熟悉的家门口，真实住宅环境，傍晚柔和自然光，熟悉的墙面、门框、门垫和生活痕迹，不出现明确文字。旅行猫咪刚走到门口，只露出尾巴、后腿和一小块背部，身体朝向家门，鼻子和头部已经靠近门缝或门垫的位置闻熟悉的气味。猫咪不看镜头，身体姿态明显放松。前景门垫和地面，中景猫咪局部，真实生活摄影、温暖、安静、有回家的感觉。",
  },
  {
    id: "seaside-path-01",
    location: "海边小路",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/seaside-path-01.png",
    journal: "浪一声一声拍过来。我把爪子缩回去，沙子还是钻进缝里了。",
    journal_detail:
      "海边小路，真实沙滩与海岸环境，午后自然光，海浪一下一下拍向浅滩，湿沙上留下细腻纹理和贝壳碎片。旅行猫咪位于画面右下侧，只露出一只刚缩回来的前爪、半截前腿和一点胸口，爪缝里带着少量细沙，身体被画面外自然裁切。猫咪看向海浪而不是镜头。低机位近景强调沙粒和爪子，远景海平线，真实旅行摄影、安静、自然、有轻微触感。",
  },
  {
    id: "old-alley-01",
    location: "老巷子",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/old-alley-01.png",
    journal: "路灯先亮了我的胡须。我停了一下，又往前走。",
    journal_detail:
      "老巷子傍晚，真实居民区街巷，旧墙、窄路、路灯和石板地面，天色刚暗下来，一盏暖色路灯刚刚亮起。旅行猫咪位于画面左侧墙边，只露出半张侧脸、鼻尖、几根胡须和一只耳朵，胡须刚好进入路灯亮区，身体其余部分在阴影里。猫咪停顿片刻后准备继续向前走，不看镜头。浅景深、自然街灯、真实纪实摄影、安静、有一点旅途故事感。",
  },
  {
    id: "park-bench-01",
    location: "公园长椅",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/park-bench-01.png",
    journal: "叶子落在我背上。我没动，等它自己滑下去。",
    journal_detail:
      "安静城市公园，真实秋日或初秋环境，木质长椅、青草、落叶和树影，午后自然光，一片干燥树叶刚落到旅行猫咪背上。猫咪位于画面右侧长椅旁，只露出背部、一只耳朵和尾巴自然垂落的一小段，身体趴着不动，背上的叶子缓慢滑向一侧。猫咪不看镜头。前景叶片轻微虚化，中景猫咪局部，真实自然摄影、安静、松弛、温柔。",
  },
  {
    id: "station-dusk-01",
    location: "小站黄昏",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/station-dusk-01.png",
    journal: "车来了又走。门开合的声音，我听到第三下就离开了。",
    journal_detail:
      "黄昏小火车站，真实地方车站环境，夕阳已经很低，站台、铁轨、旧候车设施和一列缓慢停靠的小火车自然出现。旅行猫咪位于画面左侧长椅下方，只露出尾巴、两只后爪和一点背部，正准备转身离开站台，没有看镜头。远处车门开合，旅客只有自然模糊轮廓。前景长椅，中景猫咪局部，远景列车与晚霞，真实纪实摄影、安静、有节奏感。",
  },
  {
    id: "rain-bridge-01",
    location: "雨后天桥",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/rain-bridge-01.png",
    journal: "铁栏杆上有一条蚯蚓。我看了很久，没敢碰。",
    journal_detail:
      "雨后城市天桥，真实湿润环境，铁栏杆挂着水珠，地面反射灰蓝色天空，远处城市建筑被雨后空气洗得清晰。旅行猫咪位于画面右侧栏杆下方，只露出半张侧脸、一只耳朵和一只前爪，头部靠近栏杆但保持一点距离，一条小蚯蚓停在湿润栏杆附近。猫咪不看镜头，身体被桥体结构遮挡。真实微距感旅行摄影、自然散射光、安静、好奇、生活化。",
  },
  {
    id: "yard-wall-01",
    location: "晒太阳的墙根",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/yard-wall-01.png",
    journal: "砖是暖的。有人从旁边走过，鞋声很轻，我没有睁开眼。",
    journal_detail:
      "安静老居民区的墙根，真实旧砖墙和石板地面，午后阳光斜斜照下来，砖墙和地面被晒得温暖，旁边有少量灰尘、落叶和生活痕迹。一名路人从旁边轻轻经过，只留下局部脚步和移动的影子。旅行猫咪蜷缩在画面右侧墙角，只露出半个背部、耳朵尖和一只前爪，眼睛不出现或保持闭眼状态，身体大部分被墙角和阴影遮住。真实生活摄影、自然光、安静、慵懒、有温度。",
  },
  {
    id: "night-window-01",
    location: "便利店门口",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/night-window-01.png",
    journal: "灯管滋滋响。我蹲着看人进出，谁也没看我。",
    journal_detail:
      "夜晚便利店门口，真实城市街角环境，冷白灯管照亮门前地面和透明玻璃，店内有人自然进出，但不突出人物脸部。旅行猫咪蹲在画面左侧墙角，只露出两只耳朵、半张侧脸和一只前爪，身体大部分藏在阴影里，安静观察门口人流，没有看镜头。前景湿润地面带一点灯光反射，中景猫咪局部，远处街道自然虚化。真实夜景摄影、安静、生活化。",
  },
  {
    id: "wild-cat-01",
    location: "河岸草地",
    image: "/images/trips/mock.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/wild-cat-01.png",
    journal: "今天遇到一只狗，朝我叫，真没礼貌。",
  },
];

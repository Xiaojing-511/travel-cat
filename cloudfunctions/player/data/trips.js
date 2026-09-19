/**
 * 旅行卡片模板
 *
 * 后续批量导入时，按此结构追加即可。系统会从这里随机抽取一次旅行。
 *
 * 字段说明：
 * - id           string  唯一标识，导入后不要改
 * - location     string  定位文案，页面展示为「定位：xxx」
 * - image        string  包内占位或尚未上云的本地路径，正式实拍请走云存储
 * - imageFileID  string  云存储 fileID，例如 cloud://.../trips/dali-flower-01.jpg
 *                        相册优先用它；没有则回退 image，再没有用 mock.png
 * - journal      string  猫咪第一人称手记。短、克制、只写一个瞬间，不要介绍景点
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
          "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/trips-upload/dali-lake-01.jpg",
    journal: "风从湖上吹过来，把我的耳朵吹成了两片小旗子。",
  },
  {
    id: "dali-flower-01",
    location: "云南·大理",
    image: "/images/trips/dali-flower-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/trips-upload/dali-flower-01.jpg",
    journal: "窗外有一团黄色的花。我闻了闻，没有家里的香。",
  },
  {
    id: "dali-courtyard-01",
    location: "云南·白墙小院",
    image: "/images/trips/mock.png",
    journal: "下午有人在院子里晒衣服。床单飘起来的时候，我躲了一下。",
  },
  {
    id: "dali-goat-01",
    location: "云南·山坡",
    image: "/images/trips/mock.png",
    journal: "遇到一只小羊。它一直盯着我，我也一直盯着它。",
  },
  {
    id: "lijiang-alley-01",
    location: "云南·丽江古巷",
    image: "/images/trips/mock.png",
    journal: "石板路有点凉。我踩着别人留下的脚印走了一小段。",
  },
  {
    id: "lijiang-river-01",
    location: "云南·小河边",
    image: "/images/trips/mock.png",
    journal: "水里有一片叶子，比我走得还快。",
  },
  {
    id: "shangri-la-sun-01",
    location: "云南·香格里拉",
    image: "/images/trips/mock.png",
    journal: "太阳突然照到身上。我原本想继续走，后来改成趴着了。",
  },

  // =========================
  // 四川
  // =========================
  {
    id: "chengdu-alley-01",
    location: "四川·成都老巷",
    image: "/images/trips/mock.png",
    journal: "门口趴着一只胖猫。它看起来比我更像这里的主人。",
  },
  {
    id: "chengdu-teahouse-01",
    location: "四川·茶馆窗边",
    image: "/images/trips/mock.png",
    journal: "里面的人聊了很久。我没听懂，但茶香很好闻。",
  },
  {
    id: "chengdu-panda-01",
    location: "四川·熊猫基地",
    image: "/images/trips/mock.png",
    journal: "那只黑白家伙吃竹子吃得很认真。我有点佩服它。",
  },
  {
    id: "emeishan-mountain-01",
    location: "四川·峨眉山",
    image: "/images/trips/mock.png",
    journal: "树上有只猴子抢走了一块面包。我觉得它很会挑时间。",
  },
  {
    id: "jiuzhaigou-water-01",
    location: "四川·九寨沟",
    image: "/images/trips/mock.png",
    journal: "水底的石头看起来像睡着了。我也差点一起睡着。",
  },
  {
    id: "sichuan-rain-01",
    location: "四川·雨巷",
    image: "/images/trips/mock.png",
    journal: "雨停以后，瓦片一滴一滴地响。我坐在那里听了很久。",
  },

  // =========================
  // 西藏
  // =========================
  {
    id: "lhasa-rooftop-01",
    location: "西藏·拉萨屋顶",
    image: "/images/trips/mock.png",
    journal: "太阳离我好近。我闭着眼睛，脸一直热热的。",
  },
  {
    id: "lhasa-street-01",
    location: "西藏·小街",
    image: "/images/trips/mock.png",
    journal: "风里没有家里的味道。可是晒过太阳的墙，很像。",
  },
  {
    id: "namsto-lake-01",
    location: "西藏·纳木错",
    image: "/images/trips/mock.png",
    journal: "湖一直望不到头。我决定不数了。",
  },
  {
    id: "snow-mountain-01",
    location: "西藏·雪山脚下",
    image: "/images/trips/mock.png",
    journal: "雪光太亮了。我把眼睛眯起来，假装自己还在睡觉。",
  },

  // =========================
  // 新疆
  // =========================
  {
    id: "xinjiang-grassland-01",
    location: "新疆·草原",
    image: "/images/trips/mock.png",
    journal: "草长得比我的肚皮还高。我走进去以后，就看不见自己的脚了。",
  },
  {
    id: "xinjiang-lake-01",
    location: "新疆·赛里木湖",
    image: "/images/trips/mock.png",
    journal: "湖面安静得不像水。我偷偷伸了一只爪子过去。",
  },
  {
    id: "xinjiang-poplar-01",
    location: "新疆·胡杨林",
    image: "/images/trips/xinjiang-poplar-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/trips-upload/xinjiang-poplar-01.jpg",
    journal: "风吹过树叶的时候，像好多只猫一起在说话。",
  },
  {
    id: "xinjiang-sheep-01",
    location: "新疆·牧场",
    image: "/images/trips/mock.png",
    journal: "一群羊从我面前经过。最后那只回头看了我一眼。",
  },
  {
    id: "turpan-grape-01",
    location: "新疆·葡萄架下",
    image: "/images/trips/mock.png",
    journal: "葡萄一串一串挂在头顶。我抬头看得脖子有点酸。",
  },
  {
    id: "kashgar-old-city-01",
    location: "新疆·喀什老城",
    image: "/images/trips/mock.png",
    journal: "阳光爬过黄色的墙。我跟着它走了半条街。",
  },

  // =========================
  // 青海 / 甘肃
  // =========================
  {
    id: "qinghai-lake-01",
    location: "青海·青海湖",
    image: "/images/trips/mock.png",
    journal: "风很大。我把身体压低了一点，感觉自己更稳了。",
  },
  {
    id: "chaka-salt-01",
    location: "青海·茶卡盐湖",
    image: "/images/trips/mock.png",
    journal: "地面亮得像水。我低头找了半天，没找到鱼。",
  },
  {
    id: "dunhuang-desert-01",
    location: "甘肃·敦煌沙漠",
    image: "/images/trips/mock.png",
    journal: "沙子钻进了爪缝。我走了一会儿，决定原谅它。",
  },
  {
    id: "dunhuang-crescent-01",
    location: "甘肃·月牙泉",
    image: "/images/trips/mock.png",
    journal: "远远看见一弯水，像有人把月亮藏在沙子里。",
  },
  {
    id: "zhangye-rainbow-01",
    location: "甘肃·张掖",
    image: "/images/trips/mock.png",
    journal: "山是好多种颜色。我站着看，忘了自己本来要去哪。",
  },

  // =========================
  // 陕西
  // =========================
  {
    id: "xian-wall-01",
    location: "陕西·西安城墙",
    image: "/images/trips/mock.png",
    journal: "墙很高。我站在边上吹了一会儿风，觉得自己也很高。",
  },
  {
    id: "xian-bell-01",
    location: "陕西·古城钟楼",
    image: "/images/trips/mock.png",
    journal: "钟声突然响起来。我吓得尾巴竖了一下。",
  },
  {
    id: "xian-night-01",
    location: "陕西·夜市",
    image: "/images/trips/mock.png",
    journal: "到处都是香味。我决定先闻一遍，再决定想吃什么。",
  },

  // =========================
  // 北京
  // =========================
  {
    id: "beijing-hutong-01",
    location: "北京·胡同",
    image: "/images/trips/mock.png",
    journal: "一只鸽子走得比我还慢。我们并排走了一会儿。",
  },
  {
    id: "beijing-rooftop-01",
    location: "北京·屋顶",
    image: "/images/trips/mock.png",
    journal: "风把远处的声音带过来。有人在喊一只猫回家。",
  },
  {
    id: "beijing-forbidden-01",
    location: "北京·红墙边",
    image: "/images/trips/mock.png",
    journal: "墙被太阳晒得暖暖的。我靠了一下，没有人赶我走。",
  },
  {
    id: "beijing-snow-01",
    location: "北京·雪天",
    image: "/images/trips/mock.png",
    journal: "第一片雪落在我鼻子上。我打了个喷嚏。",
  },

  // =========================
  // 江南
  // =========================
  {
    id: "suzhou-garden-01",
    location: "江苏·苏州园林",
    image: "/images/trips/mock.png",
    journal: "窗子里还有一个窗子。我看了一会儿，还是没看懂。",
  },
  {
    id: "suzhou-bridge-01",
    location: "江苏·小桥",
    image: "/images/trips/mock.png",
    journal: "桥下面有鱼。它们比我想象得要胖很多。",
  },
  {
    id: "wuzhen-rain-01",
    location: "浙江·乌镇",
    image: "/images/trips/mock.png",
    journal: "雨落在水里，又落在屋檐上。我分不清是哪一种声音更好听。",
  },
  {
    id: "hangzhou-lake-01",
    location: "浙江·西湖边",
    image: "/images/trips/mock.png",
    journal: "船轻轻过去，水纹也跟着走。我伸爪子碰了一下。",
  },
  {
    id: "hangzhou-tea-01",
    location: "浙江·茶山",
    image: "/images/trips/mock.png",
    journal: "空气里有一股青涩的味道。和我小时候闻过的春天有点像。",
  },

  // =========================
  // 上海
  // =========================
  {
    id: "shanghai-window-01",
    location: "上海·弄堂",
    image: "/images/trips/mock.png",
    journal: "窗台晒着一床被子。我闻了一下，偷偷蹭了两下。",
  },
  {
    id: "shanghai-bund-01",
    location: "上海·江边",
    image: "/images/trips/mock.png",
    journal: "河对面亮了好多灯。我看了一会儿，觉得晚上也不坏。",
  },
  {
    id: "shanghai-cat-01",
    location: "上海·街角",
    image: "/images/trips/mock.png",
    journal: "遇到一只橘猫。它没有理我，我也假装没有理它。",
  },
  {
    id: "shanghai-rain-01",
    location: "上海·雨夜",
    image: "/images/trips/mock.png",
    journal: "雨下得很密。我躲进屋檐下面，想起了我的窝。",
  },

  // =========================
  // 福建
  // =========================
  {
    id: "xiamen-seaside-01",
    location: "福建·厦门海边",
    image: "/images/trips/mock.png",
    journal: "有人在远处骑车。海风把他的衣角吹得一直往后跑。",
  },
  {
    id: "xiamen-gulangyu-01",
    location: "福建·鼓浪屿",
    image: "/images/trips/mock.png",
    journal: "巷子里有一扇蓝色的门。我绕进去以后，忘了原来的路。",
  },
  {
    id: "quanzhou-temple-01",
    location: "福建·泉州古街",
    image: "/images/trips/mock.png",
    journal: "香火的味道飘过来。我打了个喷嚏，神仙应该不会介意。",
  },

  // =========================
  // 广东
  // =========================
  {
    id: "guangzhou-morning-01",
    location: "广东·广州街头",
    image: "/images/trips/mock.png",
    journal: "太阳还没完全出来，就有人已经开始忙了。我决定继续睡一会儿。",
  },
  {
    id: "guangzhou-river-01",
    location: "广东·珠江边",
    image: "/images/trips/mock.png",
    journal: "江边很热。我找了一块阴影，把自己折成一小团。",
  },
  {
    id: "chaozhou-bridge-01",
    location: "广东·潮州",
    image: "/images/trips/mock.png",
    journal: "桥上的风吹起来很舒服。我差点忘记回去了。",
  },

  // =========================
  // 广西
  // =========================
  {
    id: "guilin-river-01",
    location: "广西·漓江",
    image: "/images/trips/mock.png",
    journal: "船慢慢经过。我跟着它走了一段，后来船比我快。",
  },
  {
    id: "yangshuo-hill-01",
    location: "广西·阳朔",
    image: "/images/trips/mock.png",
    journal: "山一座接一座，像好多只猫趴在远处。",
  },
  {
    id: "longji-stairs-01",
    location: "广西·龙脊梯田",
    image: "/images/trips/mock.png",
    journal: "台阶一层一层。我走累了，就坐下来数云。",
  },

  // =========================
  // 海南
  // =========================
  {
    id: "sanya-beach-01",
    location: "海南·三亚海边",
    image: "/images/trips/mock.png",
    journal: "浪把一只贝壳推到我脚边。我推回去了，它又回来了。",
  },
  {
    id: "hainan-palm-01",
    location: "海南·椰林",
    image: "/images/trips/mock.png",
    journal: "树影一直摇。我躺在下面，看了很久。",
  },

  // =========================
  // 贵州
  // =========================
  {
    id: "guizhou-village-01",
    location: "贵州·山间村寨",
    image: "/images/trips/mock.png",
    journal: "屋檐下挂着很多辣椒。看起来有点凶，我没有靠近。",
  },
  {
    id: "huangguoshu-water-01",
    location: "贵州·瀑布边",
    image: "/images/trips/mock.png",
    journal: "水声特别大。我往后退了两步，又忍不住走回来。",
  },
  {
    id: "qianhu-miao-01",
    location: "贵州·苗寨夜色",
    image: "/images/trips/mock.png",
    journal: "好多窗子亮起来了。每一扇里面，应该都有故事吧。",
  },

  // =========================
  // 重庆
  // =========================
  {
    id: "chongqing-stairs-01",
    location: "重庆·山城小路",
    image: "/images/trips/mock.png",
    journal: "刚走完一段楼梯，又看见一段。我怀疑这里没有平路。",
  },
  {
    id: "chongqing-night-01",
    location: "重庆·江边夜色",
    image: "/images/trips/mock.png",
    journal: "灯映在水里，一直晃。我伸爪子捞了一下，什么也没有。",
  },
  {
    id: "chongqing-cat-01",
    location: "重庆·街角屋檐",
    image: "/images/trips/mock.png",
    journal: "碰见一只花猫。它带我绕了一圈，然后自己回家了。",
  },

  // =========================
  // 湖北 / 湖南
  // =========================
  {
    id: "wuhan-lake-01",
    location: "湖北·东湖边",
    image: "/images/trips/mock.png",
    journal: "湖边的风很软。我在那里坐着，尾巴偶尔动一下。",
  },
  {
    id: "wuhan-bridge-01",
    location: "湖北·江边大桥",
    image: "/images/trips/mock.png",
    journal: "桥上的车一辆接一辆。我数到二十六，就不想数了。",
  },
  {
    id: "zhangjiajie-cloud-01",
    location: "湖南·张家界",
    image: "/images/trips/mock.png",
    journal: "山从云里伸出来。我盯着看了一会儿，感觉它也在看我。",
  },
  {
    id: "fenghuang-river-01",
    location: "湖南·凤凰古城",
    image: "/images/trips/mock.png",
    journal: "河水慢慢流。灯亮起来以后，整条河都变得温柔了。",
  },

  // =========================
  // 山东
  // =========================
  {
    id: "qingdao-seaside-01",
    location: "山东·青岛海边",
    image: "/images/trips/mock.png",
    journal: "海水有点凉。我只让一只爪子碰到它。",
  },
  {
    id: "qingdao-redroof-01",
    location: "山东·红瓦屋顶",
    image: "/images/trips/mock.png",
    journal: "远处的屋顶都是红色的。我突然想起家里的小毯子。",
  },
  {
    id: "taishan-dawn-01",
    location: "山东·泰山日出",
    image: "/images/trips/mock.png",
    journal: "天一点一点变亮。我缩成一团，没舍得闭眼。",
  },

  // =========================
  // 东北
  // =========================
  {
    id: "harbin-snow-01",
    location: "黑龙江·哈尔滨",
    image: "/images/trips/mock.png",
    journal: "踩下去会咯吱响的雪，我来回踩了五次。",
  },
  {
    id: "harbin-window-01",
    location: "黑龙江·窗边",
    image: "/images/trips/mock.png",
    journal: "屋里很暖，窗外很冷。我选了里面。",
  },
  {
    id: "changbai-mountain-01",
    location: "吉林·长白山",
    image: "/images/trips/mock.png",
    journal: "雪地上有一排很小的脚印。我跟着它走，最后它钻进树丛里了。",
  },
  {
    id: "snow-forest-01",
    location: "东北·雪林",
    image: "/images/trips/mock.png",
    journal: "树上落下来一小团雪，刚好砸在我的头上。",
  },

  // =========================
  // 内蒙古
  // =========================
  {
    id: "inner-mongolia-grassland-01",
    location: "内蒙古·草原",
    image: "/images/trips/mock.png",
    journal: "草一直延伸到很远。我第一次觉得天空好像也变大了。",
  },
  {
    id: "inner-mongolia-horse-01",
    location: "内蒙古·牧场",
    image: "/images/trips/mock.png",
    journal: "那匹马低头看我。我抬头看它，脖子有点酸。",
  },

  // =========================
  // 河南
  // =========================
  {
    id: "luoyang-peony-01",
    location: "河南·洛阳花丛",
    image: "/images/trips/mock.png",
    journal: "花比我的脸还大。我闻了一下，然后打了个喷嚏。",
  },
  {
    id: "songshan-mountain-01",
    location: "河南·嵩山",
    image: "/images/trips/mock.png",
    journal: "石头被太阳晒得暖暖的。我靠上去，暂时不想走了。",
  },

  // =========================
  // 安徽
  // =========================
  {
    id: "huangshan-cloud-01",
    location: "安徽·黄山",
    image: "/images/trips/mock.png",
    journal: "云从脚下过去。我低头看了一眼，突然觉得自己会飞。",
  },
  {
    id: "hongcun-rain-01",
    location: "安徽·宏村",
    image: "/images/trips/mock.png",
    journal: "雨落在屋檐上，一串接一串。我趴在那里听了一下午。",
  },

  // =========================
  // 江西
  // =========================
  {
    id: "wuyuan-flower-01",
    location: "江西·婺源",
    image: "/images/trips/mock.png",
    journal: "山坡上的花一起晃。我走过去，它们又一起晃回来。",
  },
  {
    id: "jingdezhen-pottery-01",
    location: "江西·陶瓷小镇",
    image: "/images/trips/mock.png",
    journal: "有人把一个圆圆的东西放在桌上。我绕着它看了三圈。",
  },

  // =========================
  // 福建 / 四川 / 广域旅行
  // =========================
  {
    id: "night-train-01",
    location: "夜行列车",
    image: "/images/trips/mock.png",
    journal: "窗外一直在往后跑。我靠着窗睡了一觉，醒来以后天亮了。",
  },
  {
    id: "mountain-road-01",
    location: "山间公路",
    image: "/images/trips/mock.png",
    journal: "车开得很慢。路边的小树一棵一棵往后退。",
  },

  // =========================
  // 猫咪想家
  // =========================
  {
    id: "miss-home-01",
    location: "陌生城市的夜晚",
    image: "/images/trips/mock.png",
    journal: "今天没有遇到特别的事情。只是突然想睡家里的那块垫子。",
  },
  {
    id: "miss-home-02",
    location: "旅馆窗台",
    image: "/images/trips/mock.png",
    journal: "窗外的灯很好看。看了一会儿，我还是想回家。",
  },
  {
    id: "miss-home-03",
    location: "远方的小镇",
    image: "/images/trips/mock.png",
    journal: "今天闻到一股很像家的味道。我追过去，却不是那里。",
  },
  {
    id: "miss-home-04",
    location: "回程路上",
    image: "/images/trips/mock.png",
    journal: "东西都收好了。我在门口坐了一会儿，突然有点舍不得。",
  },
  {
    id: "miss-home-05",
    location: "清晨车站",
    image: "/images/trips/mock.png",
    journal: "天刚刚亮。我想，回去以后要先吃东西，再睡一整天。",
  },

  // =========================
  // 和其他小动物相遇
  // =========================
  {
    id: "animal-dog-01",
    location: "河边草地",
    image: "/images/trips/mock.png",
    journal: "今天遇到一只狗。它朝我叫，真没礼貌。",
  },
  {
    id: "animal-bird-01",
    location: "屋檐下面",
    image: "/images/trips/mock.png",
    journal: "一只麻雀跳到离我很近的地方。它没跑，我也没动。",
  },
  {
    id: "animal-butterfly-01",
    location: "山野花间",
    image: "/images/trips/mock.png",
    journal: "蝴蝶停在我的鼻子前。我屏住呼吸，它才没有飞走。",
  },
  {
    id: "animal-turtle-01",
    location: "池塘边",
    image: "/images/trips/mock.png",
    journal: "有只乌龟走得很慢。我等了它一下。",
  },
  {
    id: "animal-rabbit-01",
    location: "草地深处",
    image: "/images/trips/mock.png",
    journal: "草丛里突然跳出一只兔子。它跑得比我想象中快很多。",
  },
  {
    id: "animal-goose-01",
    location: "湖边",
    image: "/images/trips/mock.png",
    journal: "一只鹅从我面前经过。我决定绕远一点。",
  },

  // =========================
  // 标志性建筑 / 地标，但仍保持猫视角
  // =========================
  {
    id: "landmark-great-wall-01",
    location: "北京·长城",
    image: "/images/trips/mock.png",
    journal: "路一直往前。我走了一小段，回头的时候已经看不到出发的地方了。",
  },
  {
    id: "landmark-bund-01",
    location: "上海·外滩",
    image: "/images/trips/mock.png",
    journal: "楼都很高。我抬头看了很久，脖子有点累。",
  },
  {
    id: "landmark-west-lake-01",
    location: "杭州·湖边",
    image: "/images/trips/mock.png",
    journal: "桥的影子落在水里。我从影子上走过去了。",
  },
  {
    id: "landmark-potala-01",
    location: "西藏·拉萨",
    image: "/images/trips/mock.png",
    journal: "那座白色的房子站得很高。我坐在下面看了很久。",
  },
  {
    id: "landmark-pagoda-01",
    location: "云南·大理古城",
    image: "/images/trips/landmark-pagoda-01.png",
    imageFileID:
      "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/trips-upload/landmark-pagoda-01.jpg",
    journal: "远处有一座塔。我走了好久，它还是在那里。",
  },

  // =========================
  // 非地名型治愈卡
  // =========================
  {
    id: "quiet-sun-01",
    location: "路边的长椅",
    image: "/images/trips/mock.png",
    journal: "太阳落下来一点，我也跟着换了个位置。",
  },
  {
    id: "quiet-shadow-01",
    location: "树下",
    image: "/images/trips/mock.png",
    journal: "树影一直晃。我伸爪子按住一块，当然没按住。",
  },
  {
    id: "quiet-window-01",
    location: "旅馆窗边",
    image: "/images/trips/mock.png",
    journal: "天亮得比我早。我醒来以后，窗外已经有人在走路了。",
  },
  {
    id: "quiet-food-01",
    location: "小店门口",
    image: "/images/trips/mock.png",
    journal: "闻到鱼汤的时候，我突然觉得旅行也没有那么辛苦。",
  },
  {
    id: "quiet-pillow-01",
    location: "陌生房间",
    image: "/images/trips/mock.png",
    journal: "枕头不是我的味道。我踩了几下，还是勉强可以睡。",
  },
  {
    id: "quiet-sunset-01",
    location: "山边黄昏",
    image: "/images/trips/mock.png",
    journal: "太阳下去了。今天就先这样吧。",
  },
  {
    id: "quiet-message-01",
    location: "旅途中的夜晚",
    image: "/images/trips/mock.png",
    journal: "有人好像在等我回去。我不知道她有没有想我。",
  },
  {
    id: "quiet-return-01",
    location: "回到熟悉的地方",
    image: "/images/trips/mock.png",
    journal: "闻到熟悉的味道以后，我知道自己到家了。",
  },
  {
    id: "seaside-path-01",
    location: "海边小路",
    image: "/images/trips/mock.png",
    journal: "浪一声一声拍过来。我把爪子缩回去，沙子还是钻进缝里了。",
  },
  {
    id: "old-alley-01",
    location: "老巷子",
    image: "/images/trips/mock.png",
    journal: "路灯先亮了我的胡须。我停了一下，又往前走。",
  },
  {
    id: "park-bench-01",
    location: "公园长椅",
    image: "/images/trips/mock.png",
    journal: "叶子落在我背上。我没动，等它自己滑下去。",
  },
  {
    id: "station-dusk-01",
    location: "小站黄昏",
    image: "/images/trips/mock.png",
    journal: "车来了又走。门开合的声音，我听到第三下就离开了。",
  },
  {
    id: "rain-bridge-01",
    location: "雨后天桥",
    image: "/images/trips/mock.png",
    journal: "铁栏杆上有一条蚯蚓。我看了很久，没敢碰。",
  },
  {
    id: "yard-wall-01",
    location: "晒太阳的墙根",
    image: "/images/trips/mock.png",
    journal: "砖是暖的。有人从旁边走过，鞋声很轻，我没有睁开眼。",
  },
  {
    id: "night-window-01",
    location: "便利店门口",
    image: "/images/trips/mock.png",
    journal: "灯管滋滋响。我蹲着看人进出，谁也没看我。",
  },
  {
    id: "wild-cat-01",
    location: "河岸草地",
    image: "/images/trips/mock.png",
    journal: "今天遇到一只狗，朝我叫，真没礼貌。",
  },
];

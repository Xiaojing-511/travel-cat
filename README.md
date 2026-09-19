# 一只猫的旅行

微信小程序。家里养着一只会自己出门的猫：你负责添粮添水，它在家睡觉、发呆、等你，偶尔背着小包出门，回来后往相册里塞一张第一人称手记。

## 功能

- 首页：看猫、喂粮喂水、看出门倒计时
- 旅行记忆：明信片列表和详情（定位、照片、手记）
- 云开发：按用户存时间线和明信片，开关小程序后时间仍会往前走

## 本地运行

1. 用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)打开本仓库
2. 使用项目已配置的 AppID 和云环境
3. 右键 `cloudfunctions/player` → 上传并部署（云端安装依赖）
4. 编译预览。首次进入会登录并创建玩家

根目录 `npm install` 只给图片脚本用，小程序本身不依赖它。

## 发版审核

旅行可能要几小时到两天，审核员等不到猫回家。因此**相册还没有真实明信片时，会展示 4 张示例旅行记忆**（洱海、大理、胡杨林、大理古城），可点开列表和明信片详情。用户第一次真正收到明信片后，示例不再出现。

审核时可直接验证：

1. 首页能看到猫和粮水
2. 点「喂」粮水增加
3. 右上角相册能打开，有 4 张带图明信片
4. 点一张能看到定位、照片和手记

示例数据在 `miniprogram/data/review-cards.js`。照片走云存储 `trips-upload/`，发版前请确认这 4 张 jpg 已上传。

## 常用脚本

```bash
npm test                 # 游戏规则测试
npm run after-edit       # 测试 + 打包旅行图 + 同步云函数代码
npm run compress-assets  # 压缩包内图片（主包需小于 2MB）
npm run upload-trip-images
```

改完 `miniprogram/utils/game.js` 或 `miniprogram/data/trips.js` 后跑 `npm run after-edit`，不要手改 `cloudfunctions/player` 里的副本。

之后在开发者工具里：

1. 有新旅行图时，把 `tmp/trips-upload/` 传到云存储目录 `trips-upload/`
2. 有 BGM 时，把 `tmp/audio-upload/bgm.mp3` 传到 `audio/bgm.mp3`
3. 重新上传并部署云函数 `player`
4. 上传小程序

## 资源体积

主包限制 2MB。背景、猫咪、食盆会压进包内；旅行原图、原始背景 PNG、BGM 由 `project.config.json` 的 `packOptions` 排除。当前打包体积大约 0.77MB。

## 目录

```
miniprogram/           小程序
  pages/index/         首页
  pages/cards/         旅行记忆
  data/trips.js        旅行卡片模板
  data/review-cards.js 审核用示例明信片
  utils/game.js        状态与旅行规则
cloudfunctions/player  登录、追赶时间线、喂食、明信片
scripts/               测试、压图、同步云函数
docx/                  规则说明
```

更细的状态机和存储约定见 `docx/`。

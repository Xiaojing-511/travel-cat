# n8n《一只猫的旅行》图片批量生成与腾讯云 COS 上传工作流

## 1. 工作流目的

这条 n8n 工作流的真实入口不是“图片 URL”，而是：

- 上传一个旅行卡片 **JSON 文件**
- 上传一张作为视觉参考的 **参考图片**

工作流读取 JSON 中的旅行卡片数据，以参考图片作为统一视觉风格/猫咪形象参考，逐条生成或处理旅行场景图片，最后把图片上传到腾讯云 COS，并将最终图片地址回写到对应卡片数据。

核心链路：

```text
上传 JSON 文件 + 参考图片
           ↓
       读取两个文件
           ↓
    解析 JSON 卡片数据
           ↓
  保留参考图片 Binary
           ↓
   逐条处理旅行卡片
           ↓
  根据 location / journal
   生成旅行场景 Prompt
           ↓
   AI 图片生成 / 图片处理
           ↓
       得到图片 URL
           ↓
 HTTP Request 下载为 Binary
           ↓
     Binary Property = image
           ↓
      S3 / COS 上传
           ↓
    得到最终图片地址
           ↓
      回写 card.image
           ↓
   输出完整旅行卡片 JSON
```

---

# 2. 第一节点：上传 JSON 文件 + 参考图片

## 2.1 入口输入

第一节点负责一次性接收两个文件：

```text
① 旅行卡片 JSON 文件
② 参考图片
```

例如：

```text
travel_cards.json
reference.png
```

JSON 文件中保存旅行卡片数据，例如：

```json
[
  {
    "id": "yunnan_dali_001",
    "location": "云南·大理",
    "journal": "今天看到一种在窗外没看过的花，是黄色的，一团团的。"
  },
  {
    "id": "anhui_huangshan_001",
    "location": "安徽·黄山",
    "journal": "云从脚下过去。我低头看了一眼，突然觉得自己会飞。"
  }
]
```

参考图片的作用是提供统一的视觉参考，例如：

- 猫咪形象
- 毛色和外观
- 摄影视角
- 画面质感
- 构图风格

---

## 2.2 第一节点的数据结构

因为上传的是文件，所以这里的数据重点不是普通 JSON 字段，而是 **Binary**。

理想状态下可以理解为：

```text
Binary
├── json_file
│   ├── data
│   ├── fileName
│   └── mimeType
│
└── reference_image
    ├── data
    ├── fileName
    └── mimeType
```

实际字段名以第一节点的上传控件配置为准。

建议从工作流一开始就固定字段名称，例如：

```text
JSON 文件：json_file
参考图片：reference_image
```

这样后续节点不会因为字段名称变化而断链。

---

# 3. 解析 JSON 文件

上传 JSON 文件后，需要把 Binary 中的 JSON 内容转换为可以被 n8n 逐条处理的普通 JSON 数据。

数据转换逻辑：

```text
Binary JSON 文件
       ↓
读取文件内容
       ↓
解析 JSON 字符串
       ↓
得到旅行卡片数组
       ↓
一条卡片 = 一个 Item
```

例如原始文件：

```json
[
  {
    "id": "001",
    "location": "云南·大理",
    "journal": "今天看到一种黄色的花。"
  },
  {
    "id": "002",
    "location": "安徽·黄山",
    "journal": "云从脚下过去。"
  }
]
```

解析后应该变成可以循环处理的 Item：

```text
Item 0
├── id: 001
├── location: 云南·大理
└── journal: 今天看到一种黄色的花。

Item 1
├── id: 002
├── location: 安徽·黄山
└── journal: 云从脚下过去。
```

---

# 4. 参考图片 Binary 必须保留

这里有一个很重要的数据流原则：

**解析 JSON 时不能把第一节点中的参考图片 Binary 丢掉。**

后面的 AI 图片生成节点还需要使用这张参考图。

因此整个工作流需要同时维护两类数据：

```text
普通 JSON 数据
└── 当前旅行卡片

Binary 数据
└── reference_image
```

逻辑上是：

```text
旅行卡片 JSON
       +
参考图片 Binary
       ↓
AI 图片生成
```

不要只把 JSON 转换成普通数据后直接覆盖 Item，否则参考图片可能丢失。

---

# 5. 逐条处理旅行卡片

解析后的旅行卡片进入循环处理流程。

建议按：

```text
1 张卡片
→ 生成 1 张图片
→ 上传 1 张图片
→ 回写 1 条卡片
```

例如：

```text
云南·大理
   ↓
生成 Prompt
   ↓
生成图片
   ↓
上传 COS
   ↓
得到图片地址
   ↓
写入 image
```

再处理下一张：

```text
安徽·黄山
   ↓
生成 Prompt
   ↓
生成图片
   ↓
上传 COS
   ↓
得到图片地址
```

这样方便控制并发、重试以及失败卡片定位。

---

# 6. 根据 location + journal 生成图片 Prompt

每条卡片至少使用：

```text
location
journal
```

作为图片场景描述的基础。

同时加入参考图片，统一猫咪形象与视觉风格。

针对《一只猫的旅行》的目标风格，Prompt 应保持：

```text
真实旅行摄影
+
真实地点环境
+
Polaroid / 拍立得照片质感
+
猫咪第一视角
+
画面中只出现猫咪身体的一小部分
+
猫咪不直视镜头
+
安静、自然、放松
```

例如：

```text
location：云南·大理

journal：
今天看到一种在窗外没看过的花，是黄色的，一团团的。
```

生成的场景方向应该围绕：

```text
大理真实环境
+
黄色花朵
+
猫咪正在观察环境
+
猫耳 / 前爪等局部进入画面
+
不让猫咪成为传统意义上的摆拍主体
```

---

# 7. AI 图片生成 / 图片处理节点

这一阶段接收：

```text
旅行卡片数据
+
参考图片 Binary
+
图片 Prompt
```

输出通常不是直接的 Binary，而可能是：

```json
{
  "image_url": "https://.../generated.png"
}
```

此时要注意：

```text
image_url
```

仍然只是普通 JSON 字段，**不是 n8n Binary**。

因此不能直接把它交给 S3 上传节点的 Binary 输入。

---

# 8. HTTP Request：把生成图片 URL 转成 Binary

## 8.1 作用

HTTP Request 节点负责下载 AI 生成的图片。

流程：

```text
AI 图片生成
      ↓
得到 image_url
      ↓
HTTP Request GET
      ↓
下载图片
      ↓
保存为 Binary
```

## 8.2 配置

### Method

```text
GET
```

### URL

根据图片生成节点实际输出字段填写。

例如：

```text
{{$json.image_url}}
```

如果字段实际叫 `url`：

```text
{{$json.url}}
```

不要写死字段名称，以实际上游输出为准。

---

# 9. Binary Property 设置

进入 HTTP Request 节点的响应配置：

```text
Options
→ Response
```

设置：

```text
Response Format:
File
```

然后设置输出 Binary 字段：

```text
Put Output in Field / Binary Property:
image
```

不同版本的 n8n 可能显示不同名称，但作用相同。

最终逻辑：

```text
HTTP Request
├── Method: GET
├── URL: {{$json.image_url}}
├── Response Format: File
└── Binary Property: image
```

执行成功以后：

```text
JSON
├── id
├── location
├── journal
└── image_url

Binary
└── image
    ├── data
    ├── mimeType
    └── fileName
```

---

# 10. S3 / 腾讯云 COS 上传

HTTP Request 得到：

```text
Binary
└── image
```

下一步使用 S3 节点上传。

## 10.1 Binary Input Field

S3 节点中的：

```text
Input Binary Field
```

或者部分版本叫：

```text
Binary Input Field
```

填写：

```text
image
```

必须和 HTTP Request 的 Binary Property 完全一致。

对应关系：

```text
HTTP Request
Binary Property = image
        ↓
S3
Input Binary Field = image
```

---

# 11. 腾讯云 COS 配置

当前 Bucket：

```text
636c-cloud1-4grqnt5f5b5d8f20-1302940040
```

这个字符串是 Bucket 标识，不是 Endpoint，也不是 SecretId。

## Access Key ID

n8n：

```text
Access Key ID
```

对应腾讯云：

```text
SecretId
```

获取位置：

```text
腾讯云控制台
→ 访问管理 CAM
→ 访问密钥 / API 密钥管理
```

## Secret Access Key

n8n：

```text
Secret Access Key
```

对应腾讯云：

```text
SecretKey
```

如果原来的 SecretKey 没保存，创建后不能再次查询时，需要重新创建一组 API 密钥。

## Region

必须使用当前 CloudBase / COS 存储桶实际所在地域。

例如：

```text
ap-shanghai
```

或：

```text
ap-beijing
```

以腾讯云云存储页面实际显示的地域为准。

## Endpoint

Endpoint 根据 Region 确定。

例如上海：

```text
https://cos.ap-shanghai.myqcloud.com
```

北京：

```text
https://cos.ap-beijing.myqcloud.com
```

广州：

```text
https://cos.ap-guangzhou.myqcloud.com
```

不要在未确认 Region 的情况下直接猜 Endpoint。

---

# 12. COS 上传路径建议

建议不要所有图片直接扔在 Bucket 根目录。

可以按项目和卡片 ID 分层：

```text
travel-cat/
└── images/
    ├── yunnan_dali_001.jpg
    ├── anhui_huangshan_001.jpg
    └── xinjiang_huyang_001.jpg
```

或者：

```text
travel-cat/images/{card.id}.jpg
```

这样后续维护、覆盖、重新生成都更容易。

核心原则：

```text
card.id
```

应该作为稳定的图片文件名/路径依据，而不是使用随机名称。

---

# 13. 上传成功后的数据

S3/COS 上传成功以后，需要保留：

```text
card.id
location
journal
COS 图片地址
```

例如最终卡片：

```json
{
  "id": "yunnan_dali_001",
  "location": "云南·大理",
  "journal": "今天看到一种在窗外没看过的花，是黄色的，一团团的。",
  "image": "https://你的COS域名/travel-cat/images/yunnan_dali_001.jpg"
}
```

也就是说：

```text
原来的 image
       ↓
最终改成 COS 图片地址
```

---

# 14. 最终完整工作流

推荐整体结构：

```text
┌─────────────────────────────────┐
│ 第一节点：上传文件                │
│                                 │
│ JSON 文件 + 参考图片              │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ 解析 JSON                        │
│                                 │
│ JSON File → Travel Cards         │
│ 同时保留 reference_image Binary  │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ 循环处理每一张旅行卡片             │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ Prompt 生成                      │
│                                 │
│ location + journal               │
│ + 参考图片                        │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ AI 图片生成 / 图片处理            │
│                                 │
│ 输出 image_url                   │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ HTTP Request                     │
│                                 │
│ GET image_url                    │
│ Response Format = File           │
│ Binary Property = image          │
└───────────────┬─────────────────┘
                │
                │ Binary: image
                ↓
┌─────────────────────────────────┐
│ S3 / COS Upload                  │
│                                 │
│ Input Binary Field = image      │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ 腾讯云 COS                       │
│                                 │
│ 保存最终旅行图片                  │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ 回写卡片数据                      │
│                                 │
│ card.image = COS 图片地址         │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│ 输出最终 JSON                     │
│                                 │
│ 所有旅行卡片 + 最终图片地址        │
└─────────────────────────────────┘
```

---

# 15. 三条数据线必须分清

这套工作流最容易出错的地方，是把三种数据混在一起。

## A. JSON 文件

```text
原始旅行卡片数据
```

例如：

```json
{
  "id": "001",
  "location": "云南·大理",
  "journal": "砖是暖的。"
}
```

## B. 参考图片 Binary

```text
reference_image
```

用于 AI 图片生成时提供视觉参考。

## C. 生成图片 Binary

```text
image
```

这是 AI 图片生成之后，通过 HTTP Request 下载得到的 Binary，专门提供给 S3 上传。

所以两个 Binary 字段不要混淆：

```text
reference_image
    ↓
AI 生成参考

image
    ↓
S3 上传
```

---

# 16. 常见报错：The item has no binary field 'image'

典型提示：

```text
The item has no binary field 'image' [item 0]

Check that the parameter where you specified the input binary field name is correct,
and that it matches a field in the binary input.
```

## 原因

S3 节点填写了：

```text
Input Binary Field = image
```

但上一个节点没有：

```text
Binary
└── image
```

## 排查

打开 HTTP Request 节点执行结果，查看 Binary。

### 情况 A：没有 Binary

检查：

```text
Response Format = File
```

以及：

```text
Put Output in Field / Binary Property = image
```

### 情况 B：Binary 叫 data

如果看到：

```text
Binary
└── data
```

那么 S3 应填写：

```text
Input Binary Field = data
```

### 情况 C：Binary 叫 image

如果看到：

```text
Binary
└── image
```

那么 S3：

```text
Input Binary Field = image
```

就是正确的。

---

# 17. 另一类常见错误：参考图片丢失

如果 AI 图片生成节点需要参考图片，但前面的 JSON 解析节点执行后：

```text
Binary
└── reference_image
```

消失了，就会导致参考图无法继续传递。

因此要检查中间的 Code / Edit Fields / Set / Merge 等节点，确认没有把 Binary 数据意外删除或覆盖。

核心原则：

```text
解析 JSON
   ↓
不能只剩 JSON
   ↓
还要保留 reference_image Binary
```

---

# 18. 批量生成时的建议

《一只猫的旅行》有大量旅行卡片时，建议使用稳定的 `id` 管理图片。

例如：

```text
card.id
↓
COS 文件名
↓
card.image
```

示例：

```text
id:
yunnan_dali_001

COS path:
travel-cat/images/yunnan_dali_001.jpg

最终：
card.image = COS URL
```

这样重新运行某一张卡片时，可以根据 `id` 精确定位对应图片，而不会因为图片文件名随机变化产生重复文件。

---

# 19. 最终数据关系

可以把整个工作流理解成：

```text
输入层
│
├── JSON 文件
│     └── 旅行卡片数据
│
└── 参考图片
      └── reference_image Binary

        ↓

生成层
│
├── location
├── journal
└── reference_image
        ↓
    AI 图片生成
        ↓
    image_url

        ↓

文件层
│
└── HTTP Request
        ↓
     Binary: image
        ↓
     S3 / COS

        ↓

结果层
│
└── card.image = COS 图片地址
```

---

# 20. 最重要的字段规则

整个工作流中需要牢记：

```text
JSON 文件
≠
参考图片 Binary
≠
生成图片 URL
≠
生成图片 Binary
```

它们分别承担不同职责：

```text
JSON 文件
→ 告诉工作流“生成什么”

参考图片
→ 告诉 AI“视觉上参考什么”

image_url
→ 告诉 HTTP Request“去哪里下载生成结果”

Binary: image
→ 告诉 S3“上传哪个文件”

COS URL
→ 告诉最终 JSON“图片在哪里”
```

最关键的 Binary 对应关系是：

```text
参考图片：reference_image

AI 输出图片下载后：image

S3 上传输入：image
```

只要这条链路保持清晰，整个 JSON → AI → 图片 → COS 的批量处理流程就容易维护和排查。

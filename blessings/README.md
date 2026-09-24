# 十封心意祝福网页

这是一个动态祝福网页作品集，包含 10 个独立主题和 1 个参考特效复刻页。直接打开 `index.html` 即可浏览全部作品，不需要安装依赖，也不需要联网。

## 页面目录

| 页面 | 主题 | 文件 |
| --- | --- | --- |
| 融合 | 百词爱心复刻与立体创新双模式 | `reference-clone.html` |
| 01 | 中秋祝福 | `01-mid-autumn.html` |
| 02 | 新年祝福 | `02-new-year.html` |
| 03 | 生日祝福 | `03-birthday.html` |
| 04 | 心动告白 | `04-valentine.html` |
| 05 | 母亲节祝福 | `05-mothers-day.html` |
| 06 | 父亲节祝福 | `06-fathers-day.html` |
| 07 | 毕业祝福 | `07-graduation.html` |
| 08 | 感恩祝福 | `08-thanksgiving.html` |
| 09 | 周年祝福 | `09-anniversary.html` |
| 10 | 平安喜乐 | `10-peace.html` |

## 页面功能

- 独立的开屏动画、粒子效果、主题配色和排版
- 点击开屏按钮后播放动态祝福
- 点击开屏后立即播放完整真实钢琴 BGM
- 支持复制祝福语、系统分享和重新播放
- 支持手机与桌面浏览器的响应式布局
- 支持减少动态效果的系统偏好设置

## 定制收件人与署名

任意祝福页都支持通过地址参数替换收件人和署名：

```text
01-mid-autumn.html?to=小明&from=小红
```

打开后，页面会显示“致 小明”和“来自 小红”。参数中的中文建议使用 URL 编码后的形式进行分享。

## 修改文案

每封祝福的文字都直接写在对应 HTML 文件中：

- `.cover-title` 是开屏标题
- `.blessing-title` 是祝福主标题
- `.message-line` 是每一行祝福正文
- `.blessing-signature` 是署名

## 文件结构

```text
blessings/
├── index.html
├── 01-mid-autumn.html
├── 02-new-year.html
├── 03-birthday.html
├── 04-valentine.html
├── 05-mothers-day.html
├── 06-fathers-day.html
├── 07-graduation.html
├── 08-thanksgiving.html
├── 09-anniversary.html
├── 10-peace.html
└── assets/
    ├── blessing.css
    ├── blessing.js
    ├── favicon.svg
    ├── gallery.css
    ├── gallery.js
    └── audio/
        ├── README.md
        └── piano-bgm.mp3
```

## 音乐版权

正式 BGM 为肖邦《降 E 大调夜曲 Op. 9 No. 2》真实钢琴演奏录音，采用公共领域授权，可公开播放和分发。来源记录见 `assets/audio/README.md`。

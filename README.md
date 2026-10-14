# 个人网站（juice-butterfly.github.io）

张国志（juice）的个人网站。单页手写 HTML/CSS/JS，零构建、零 npm 依赖，双击 `index.html` 即可打开。

## 结构

```
index.html            单页全文（中文直接写在 HTML 里）
404.html              猫贴纸 404（GitHub Pages 用户站自动启用）
robots.txt / sitemap.xml / .nojekyll / .gitignore
assets/
  css/site.css        设计令牌 + 布局 + 打印 + reduced-motion
  js/site.js          details 深链展开 + scrollspy + 滚动渐入
  favicon.svg         爪印
  img/                项目截图（webp）+ 猫贴纸
  og/og-cover-2026.jpg  分享图（tools/og_cover.py 生成）
tools/
  og_cover.py         OG 分享图生成（改文案后重跑）
  subset_font.py      字体子集化（见下）
run/                  （gitignore）截图基线与字体原始文件
```

## 维护规则

1. **改了 `index.html` 的文案 → 无需处理字体**（webfont 按 unicode-range 分块，全字符集已覆盖）。
2. **OG 图文案变了 → 重跑 `python tools/og_cover.py`**。
3. 设计令牌全在 `site.css` 的 `:root`，改色只动那里。
4. 项目卡截图是真实产品图，与主题换色无关，别用生成图替代。

## 字体

霞鹜文楷（LXGW WenKai），OFL 免费商用。采用官方 webfont 拆分包（v1.7.0）：
`assets/fonts/lxgw-regular.css` + `assets/fonts/files/*.woff2`（97 块，按 unicode-range 按需加载，
总量 4.7MB，首屏实际只加载几十 KB）。全部本地自托管，不走 CDN。
字体家族名 `'LXGW WenKai'`，`site.css` 的 `--ff-heading` 已引用。
死规矩：中文 `font-weight` 不超过 500，没有真 Bold，超了会合成加粗糊成一团。
缺字分块时重新下载：文件清单在 `run/fontlist.txt`，源为
`cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/files/<文件名>`。

## 验收

改完起服务 `python -m http.server 8080`，Edge headless 截图（桌面直接 `--window-size`，
窄屏走 CDP，本机 `--window-size=390` 不生效）。基线图在 `run/baseline/`。

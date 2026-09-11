# 第三方组件与许可声明

> 本文件汇总仓库内使用的第三方开源资源的许可声明。作品自有代码、文案与立绘不受本文件约束（其授权信息见 [docs/AI使用与素材记录.md](docs/AI使用与素材记录.md)）。

## 1. 图标（`index.html` 内联 SVG sprite）

图标路径源自开源图标库 [Lucide](https://lucide.dev)（ISC 许可）的早期版本，部分图标（如手掌、垃圾桶）在入库时经改写简化，属于原图标的衍生作品，仍适用原许可。其中 `arrow-right` / `arrow-left` / `lock` / `x` / `trash-2` 等图标最初继承自 [Feather](https://feathericons.com) 项目。

### Lucide（ISC License）

```text
ISC License

Copyright (c) Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### Feather（MIT License，适用于上述继承图标）

```text
The MIT License (MIT)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

出处：<https://github.com/lucide-icons/lucide/blob/main/LICENSE>

## 2. 网页字体

页面在加载后异步请求 Google Fonts 的 Space Grotesk 与 IBM Plex Mono（SIL Open Font License 1.1），不随仓库分发字体文件；取不到时自动退回系统字体。

- Space Grotesk: <https://fonts.google.com/specimen/Space+Grotesk>
- IBM Plex Mono: <https://fonts.google.com/specimen/IBM+Plex+Mono>

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

## 3. 用户提供的表情素材

本次版本使用了用户提供的 `基础表情.zip` 中 8 个情绪 SVG，以及 `图标.zip` 中 3 个状态插画（复制到 `assets/emojis/` 与 `assets/status/`）。压缩包未附带作者、来源或许可证文件；公开发布前请向素材提供方确认授权，或替换为已确认许可的图标。

### Draco 几何解码器

`vendor/three/draco/` 包含随 Three.js 0.180.0 分发的 Google Draco glTF 解码器（JavaScript、WebAssembly 及包装脚本），用于解压 `deepseek.glb` 的几何数据。Draco 使用 Apache License 2.0，完整许可证见 [`vendor/three/draco/LICENSE`](vendor/three/draco/LICENSE)，上游为 <https://github.com/google/draco>。`DRACOLoader.js` 本身属于 Three.js，使用其 MIT 许可证。

## 4. Three.js 三维渲染组件

网页使用 [Three.js 0.180.0](https://github.com/mrdoob/three.js/tree/r180)（MIT License）。运行必需的发布文件以原始模块形式保存在 `vendor/three/`：

- `build/three.module.js`、`build/three.core.js`；
- `addons/loaders/GLTFLoader.js`；
- `addons/controls/OrbitControls.js`；
- `addons/utils/BufferGeometryUtils.js`。

完整版权和许可文本随代码保存在 [`vendor/three/LICENSE`](vendor/three/LICENSE)。重新分发或部署时须保留该文件。运行时从本地同站点加载这些模块，不依赖 unpkg。

## 5. DeepSeek 三维资产制作工具与素材记录

`tools/build-deepseek.py` 由 AI 辅助编写，使用 Blender 4.5 LTS 的 Python API 建立网格、材质、UV、骨骼、权重及动画，再通过 Blender 自带 glTF 导出器生成 `pets/deepseek.glb`。`tools/build-deepseek-textures.py` 使用 Pillow 绘制四张基色贴图。

- [Blender](https://www.blender.org/about/license/)：GNU GPL，作为制作工具使用，不随网页分发程序。
- [Pillow](https://pillow.readthedocs.io/en/stable/about.html#license)：HPND，作为贴图生成工具使用，不随网页分发库。
- 团队提供的三视图、角色设计与原立绘的出处和授权情况见 [AI 使用与素材记录](docs/AI使用与素材记录.md)。模型由程序重建，贴图由曲线和栅格绘制；工具许可证不等同于参考设计的授权。

# DeepSeek 鲸鱼女仆三维模型

本文件记录 2026 年 9 月 12 日这一轮模型的制作方式、文件、网页行为和限制。角色按团队提供的正面、侧面、背面参考图进行风格化三维重建，使用 Blender Python 脚本生成有体积的网格、材质、UV、骨骼与权重。它不是三张图片叠放的转台，也不应描述为手工雕刻或商业高精度复刻。

## 当前文件

| 文件 | 用途 |
| --- | --- |
| [`pets/deepseek.blend`](../pets/deepseek.blend) | 可编辑的 Blender 源工程，保留独立部件、材质、骨骼、动作和渲染设置 |
| [`pets/deepseek.glb`](../pets/deepseek.glb) | 网页实际加载的 glTF 2.0 二进制角色，包含网格、蒙皮、材质、四张内嵌贴图与动画 |
| [`tools/build-deepseek.py`](../tools/build-deepseek.py) | 可重复执行的 Blender 建模、蒙皮、动画、导出和渲染脚本 |
| [`tools/build-deepseek-textures.py`](../tools/build-deepseek-textures.py) | 四张贴图的确定性绘制脚本，需要 Python 与 Pillow |
| [`pets/textures/`](../pets/textures/) | 未打包前的 PNG 基色贴图，供源工程和复建使用 |
| [`output/model-review/`](../output/model-review/) | 正面、侧面、背面、四分之三视角渲染，以及构建统计 |
| [`model3d.js`](../model3d.js) | 模型加载、相机控制、动作混合与加载失败回退 |
| [`vendor/three/`](../vendor/three/) | Three.js 0.180.0、GLTFLoader、OrbitControls、必要依赖及 MIT 许可证 |

旧 `deepseek-lowpoly.glb`、`deepseek-high-detail.blend`、`deepseek-high-detail.glb` 仅作为历史迭代保留。当前网页加载的是 `deepseek.glb`，不要据旧文件名称判断当前模型质量。

## 造型与三视图对齐

建模采用 Blender 的 **Z 轴向上、角色正面朝 -Y** 的统一坐标；导出后 glTF 为 **Y 轴向上、正面朝 +Z**。模型以脚底、头顶、头身比例、裙摆、头发长度和尾部轮廓作为三视图对照位置。参考图在 Blender 中作为隐藏的编辑辅助对象保存，不参与角色网格导出。

当前制作范围包括：

- 具有侧面和背面体积的头部、面部，以及独立的眼白、凸面虹膜、睫毛、嘴部和脸颊细节。
- 头顶发壳、前额刘海、面部两侧卷发、后发体积与分层发束，使用深靛蓝到蓝色的发色渐变。
- 藏蓝女仆裙、裙摆褶皱、奶白围裙、鲸鱼图案、蕾丝、头饰、蝴蝶结、袖口和鞋袜。
- 从腰背部延伸的鲸鱼尾巴及有厚度的两片尾鳍。

部分部件采用独立网格组合以便修改和绑定，不是覆盖整个身体的一张图片。源工程保留独立部件，GLB 导出时临时按材质合并，减少网页绘制调用；合并保留骨骼顶点组。

## UV、贴图与材质

四张 PNG 都是 RGB 基色图，材质按 sRGB 读取；粗糙度和金属度由 Blender 的 Principled BSDF 参数设置。眼睛、围裙、头发和裙摆有对应 UV；其余皮肤、蕾丝、缎带等主要使用颜色与粗糙度材质。贴图在 `.blend` 中打包，并内嵌导出的 `.glb`，网页无需再单独请求这些 PNG。

图像顶端对应 Blender UV 的 **v=1**，底端对应 **v=0**：

| 贴图 | 尺寸 | UV 方向与绘制内容 |
| --- | --- | --- |
| `deepseek-iris.png` | 512 × 512 | 0–1 UV 映射到凸面虹膜；主高光在左上，瞳孔在中上，浅蓝反光在下方 |
| `deepseek-apron.png` | 1024 × 1024 | 上半部留白；鲸鱼中心约在 UV `(0.50, 0.32)`；下侧为金蓝细纹装饰 |
| `deepseek-hair.png` | 512 × 1024 | v=1 为深靛蓝发根，v=0 为蓝色发梢；U 方向连续，纵向有细微发丝纹理 |
| `deepseek-skirt.png` | 1024 × 512 | v=0 为裙底；金色海浪、藤蔓和鲸鱼连续纹样位于 v≈0.03–0.16，U 方向可平铺 |

这些贴图由曲线、渐变与确定性纹理绘制，参考图只用于配色、造型与图案位置判断，没有把三视图直接映射到身体上。

## 骨骼、权重和动画

骨架对象为 `DeepSeek_Rig`，共 14 根骨骼。网格拥有实际顶点组及 Armature 修改器；需要随部位整体移动的配件采用单骨骼权重，尾部等部位使用混合权重。此处的骨架用于当前待机和互动动作，不是完整人体动作捕捉骨架。

```text
root
├─ spine
│  ├─ head
│  │  └─ hair
│  ├─ tail
│  │  └─ flukes
│  ├─ arm.L → forearm.L → hand.L
│  └─ arm.R → forearm.R → hand.R
├─ leg.L
└─ leg.R
```

| 动作 | 时长 | 内容与网页调用 |
| --- | --- | --- |
| `Idle` | 4 秒，30 fps、0–120 帧 | 身体轻微起伏，头部、头发和尾巴摆动，网页循环播放 |
| `React` | 2 秒，30 fps、0–60 帧 | 抬手摆手、头部与尾部响应；点击后播放一次，再过渡回待机 |

网页使用 `AnimationMixer` 播放模型内的动作，旋转观察由相机的 OrbitControls 完成，不用整张立绘旋转代替骨骼动作。用户开启系统“减少动态效果”时暂停自动待机，主动点击仍可触发一次互动。

## 网页交互

在首页选择 DeepSeek，进入实验室后：

| 输入 | 行为 |
| --- | --- |
| 鼠标左键拖动 / 单指拖动 | 围绕角色旋转，可查看正面、侧面、背面，并调整俯仰 |
| 鼠标滚轮 / 双指捏合 | 缩放，距离保持在可用范围 |
| 点击角色 / 「戳它一下」 | 触发角色回复及 `React` 互动动作 |
| 双击角色 / 「复位视角」 | 回到正面并恢复合适的观察距离 |
| 方向键（画布获得焦点时） | 按步进角度旋转 |
| `+` / `-`（画布获得焦点时） | 放大 / 缩小 |
| `Home`（画布获得焦点时） | 复位视角 |
| `Enter` / 空格（画布获得焦点时） | 触发点击互动 |

加载时继续显示原立绘，只有三维模型首帧成功绘制后才替换。模块、模型或 WebGL 不可用时保留立绘；切换到其他角色、实验室隐藏、标签页隐藏或模型离开可视范围时暂停渲染。其余四只角色继续沿用原有立绘和对话行为。

当前主入口为 [GitHub Pages](https://shdh-cmyk.github.io/heikesong-zuopin/)。历史 Cloudflare 站点本轮未同步；发布和浏览器检查应以实际目标地址与资源版本为准。

## 从脚本复建

制作环境使用 Blender 4.5.10 LTS。普通 Python 需要 Pillow，Blender 自带 `bpy` 等建模模块。先生成贴图，再执行 Blender 脚本；工作目录应为仓库根目录：

```powershell
# 首次使用且尚未安装 Pillow 时执行。
python -m pip install Pillow

python tools/build-deepseek-textures.py
& 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe' --background --python tools/build-deepseek.py
```

第二条命令会重写四张同名贴图，Blender 命令会重写 `pets/deepseek.blend`、`pets/deepseek.glb`、构建统计和四张检查渲染。请先把需要保留的手工修改提交到自己的分支或另存工程；脚本不会自动读取并保留已有 `.blend` 里的手工改动。

仅重建、导出而暂不渲染时使用：

```powershell
& 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe' --background --python tools/build-deepseek.py -- --no-render
```

参考图路径在 `build-deepseek.py` 的 `refdir` 配置中；当前读取团队电脑的 `D:/OneDrive/Desktop/素材`。其他电脑没有该目录时，脚本仍能生成角色，但不会建立原始 JPG 参考对象。需要编辑对齐参考时，将 `refdir` 指向三张原图所在目录。参考图片不进入 GLB；不要把不必要的私人原始路径写入公开展示文案。

本地网页预览：

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。直接双击 HTML 的 `file://` 方式不能可靠加载 ES module、import map 和 GLB，不用于完整验收。

## 构建统计与验收证据

本轮 `output/model-review/build-stats.json` 记录的源角色统计为 **313 个独立网格、222,661 个顶点、441,398 个三角面、14 根骨骼、2 段动作**。这些是源网格统计；GLB 导出按材质合并网格，接缝和材质边界还可能影响导出顶点数，不能把源网格数量当作网页绘制调用数。后续修改以重新生成的 JSON 为准。

四方向外观证据：

- [正面](../output/model-review/front.png)
- [侧面](../output/model-review/side.png)
- [背面](../output/model-review/back.png)
- [四分之三视角](../output/model-review/three-quarter.png)

这些文件是 Blender 离线渲染。浏览器验证应另外记录实际页面截图、控制台、模型加载、鼠标与触摸操作、键盘、动作切换、移动端布局及加载失败回退；本说明不把脚本功能或离线渲染直接记为浏览器测试通过。

本轮实际浏览器检查记录见 [Playwright 验证记录](../output/playwright/verification.md)，包括压缩模型的正侧背、点击抬手、鼠标拖动、滚轮、移动端双指输入，以及 GLB/模块/WebGL 失败回退。蒙皮数值检查报告见 [validation.json](../output/model-review/validation.json)：138,434 个导出顶点、250,750 个三角面，全部顶点有有效权重，11,781 个顶点具有混合权重。

数值检查使用 glTF Transform 4.5.0 解码最终 Draco 文件，再由标准 Python 检查数组；解码中间文件不额外发布，可按以下命令重建。两份文件的 SHA-256 保存在验证报告中。

```powershell
npx --yes @gltf-transform/cli@4.5.0 dedup pets/deepseek.glb output/model-review/deepseek-dedup.glb
python tools/validate-deepseek.py pets/deepseek.glb output/model-review/deepseek-dedup.glb --output output/model-review/validation.json
```

## 已知限制

- 造型属于依据三视图进行的风格化解读，尚不能视作每个轮廓、发束或服装细节与参考图完全一致的高精度复刻。
- 没有嘴型同步、面部表情形态键或表情控制器；嘴部为造型网格，不随对话文本开合。
- 没有布料、头发物理或实时碰撞解算；裙摆和头发动作来自基础骨骼，不保证任意大幅度动作下都不穿插。
- 14 根骨骼用于现有两段动作，没有手指骨骼、完整膝关节结构、IK 控制器或通用人体动作重定向设置。
- 网页导出副本已按材质合并为 13 个网格，并简化到约 25 万三角面，使用 Draco 压缩后为 1,414,384 字节（约 1.4 MB）。本地解码器位于 `vendor/three/draco/`。可编辑源工程保留完整细节；尚未制作多档 LOD，低性能设备上的持续帧率仍取决于 GPU。
- 这是网页互动角色，并非专为 3D 打印制作的单一封闭网格；衣服、发束、眼睛与配件作为多个部件组合。
- 参考设计和原图的来源及授权记录仍需团队补充，见 [AI 使用与素材记录](AI使用与素材记录.md)。

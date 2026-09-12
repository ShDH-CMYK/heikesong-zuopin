# 拆镜鲸鱼女仆三维模型（内部资源名 deepseek）

本文件记录 2026 年 9 月 12 日切换到用户提供的 **Blue.rar** 后的模型版本。用户包已经包含有体积的角色网格、UV 与 PBR 贴图。本轮工作是在 Blender 中整理这份实体资产、统一坐标与材质，为网页副本添加蒙皮和动画，再导出 GLB。原网格和原贴图的创作不属于本轮脚本工作；原作者、生成工具及授权范围仍待团队补充。

## 当前文件

| 文件 | 用途 |
| --- | --- |
| [`pets/deepseek.blend`](../pets/deepseek.blend) | 可编辑 Blender 工程，约 82 MB；隐藏的 `SOURCE` 集合保留完整原网格及打包的四张 4K 贴图，另有网页简化副本、骨骼、动作和检查场景 |
| [`pets/deepseek.glb`](../pets/deepseek.glb) | 网页加载的 glTF 2.0 二进制角色，含 Draco 压缩网格、蒙皮、材质、三张内嵌贴图与动画 |
| [`tools/build-deepseek-blue.py`](../tools/build-deepseek-blue.py) | 从用户 OBJ 导入、重接材质、简化网页网格、绑定、制作动作、导出与渲染 |
| [`tools/prepare-blue-textures.py`](../tools/prepare-blue-textures.py) | 从用户原 PBR 贴图生成 2K 网页贴图；需要普通 Python 与 Pillow |
| [`pets/blue-textures/`](../pets/blue-textures/) | 网页版 base color、normal 和 ORM 贴图，供复建使用 |
| [`output/blue-review/`](../output/blue-review/) | 本轮正面、侧面、背面、斜侧面和互动姿态渲染，以及构建统计与数值验证记录 |
| [`model3d.js`](../model3d.js) | 模型加载、相机控制、动作混合与加载失败回退 |
| [`vendor/three/`](../vendor/three/) | Three.js 0.180.0、GLTFLoader、OrbitControls、Draco 解码器、必要依赖及许可证 |

旧 `deepseek-lowpoly.glb`、`deepseek-high-detail.blend`、`deepseek-high-detail.glb`、`tools/build-deepseek.py`、`tools/build-deepseek-textures.py`、`pets/textures/` 与 `output/model-review/` 保留为历史记录。它们对应此前的造型与纹理；当前复建使用文件名带 `blue` 的脚本。旧建模脚本会写入相同的最终模型路径，不应再次运行来覆盖本轮资产。

## 原始资产与造型保留

用户包包含：

- `bcc6d7b2890c0919444227f3cca98e2c.obj`：499,046 个顶点、998,232 个三角面，已有完整 UV，没有骨骼或动画。
- `material.mtl`：单材质及四张贴图的引用。
- `texture_pbr_20250901.png`、`texture_pbr_20250901_normal.png`、`texture_pbr_20250901_roughness.png`、`texture_pbr_20250901_metallic.png`：四张 4096 × 4096 PBR 图像。

原 OBJ 为 Y 轴向上，宽、高、深约为 `0.888178 × 1.151757 × 0.765019`。几何审计找到三个连通分量，均无边界边、非流形边或退化三角面；绝大多数面属于一个连续主网格。原文件没有显式 `vn` 法线，导入后计算平滑法线。

整理后采用 Blender 的 **Z 轴向上、角色正面朝 -Y**；导出 glTF 后为 **Y 轴向上、正面朝 +Z**。模型以脚底为高度零点，整体等比缩放到 4.7 个 Blender 单位。原有头脸、服装、头发、尾部造型和 UV 作为资产基础保留，没有再根据立绘生成另一套人物。

源网格存于默认隐藏的 `SOURCE | original 998k triangles` 集合，供后续修改或重新生成网页副本。网页副本使用 Decimate 18% 的简化比例，保留原 UV 布局，但顶点与三角面数量发生变化。融合在同一网格中的服装、发束和身体部位不会因添加骨骼就自动变成独立、适合任意动作的部件。

## UV、贴图与材质

原有 UV 的每个面角都有有效坐标，U、V 均位于 `0.000375–0.999625`。本轮沿用这些 UV；原始四张 4K PNG 保持不变，并完整打包进 `.blend` 的原始资产材质中。

网页版采用以下三张 2K 贴图，均已内嵌 `.glb`，浏览器无需另发贴图请求：

| 贴图 | 尺寸与格式 | 材质连接与处理 |
| --- | --- | --- |
| `basecolor.jpg` | 2048 × 2048，RGB JPEG，968,528 字节 | sRGB，接 Base Color；保留 4:4:4 色彩采样与渐进式编码 |
| `normal.png` | 2048 × 2048，RGB PNG，1,796,116 字节 | Non-Color；缩放后重新归一化切线空间 XYZ，经 Normal Map 节点连接，强度 0.65 |
| `orm.png` | 2048 × 2048，RGB PNG，1,567,321 字节 | Non-Color；R=255（没有烘焙 AO），G=roughness，B=metallic |

缩放使用 Lanczos。粗糙度与金属度通道保留原图缩放后的数值，没有按外观另行绘制。Base color 的 JPEG 质量从 94 开始尝试，为使文件小于 1,000,000 字节，当前输出使用质量 87；脚本会打印实际质量、各文件规格与源/输出 SHA-256。原始贴图的作者与生成方法未知，不能把格式转换写成重新创作贴图。

## 骨骼、权重和动画

新增骨架名为 `DeepSeek_Rig`，共 14 根骨骼。网页网格有实际顶点组及 Armature 修改器，按位置范围平滑混合头部、躯干、头发、手臂和尾部权重。它是服务于当前小幅动作的基础骨架，尚未建立通用人体动作重定向结构。

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
| `Idle` | 4 秒，30 fps、0–120 帧 | 身体轻微呼吸起伏、点头微摆、头发和尾部小幅摆动，网页循环播放 |
| `React` | 2 秒，30 fps、0–60 帧 | 轻微点头与侧倾、身体及手臂微动、尾部反应；点击后播放一次，再回到待机 |

本轮采用小幅动作，以适应原始融合拓扑，不再使用上一版的大幅抬手摆手动作。网页通过 `AnimationMixer` 播放模型内的骨骼动作，相机旋转则由 OrbitControls 控制。系统开启“减少动态效果”时暂停自动待机，主动点击仍可触发一次互动。

## 网页交互

在首页选择「拆镜」，进入实验室后：

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

加载时继续显示原立绘，三维模型首帧成功绘制后才替换。模块、模型或 WebGL 不可用时保留立绘；切换角色、实验室隐藏、标签页隐藏或模型离开可视范围时暂停渲染。其余四只角色沿用原有立绘和对话行为。

本轮 Blue 模型发布与验收入口为 [GitHub Pages](https://shdh-cmyk.github.io/heikesong-zuopin/)。项目另有 [Cloudflare 入口](https://subtext.tryworld.com.cn/)；该入口的 Blue 版本需单独同步并验证，发布和浏览器检查以实际目标地址与资源版本为准。上述内容描述代码支持的行为，测试结果须对应本轮证据记录。

## 从脚本复建

制作环境为 Blender 4.5.10 LTS；普通 Python 需要 Pillow，Blender 自带 `bpy`。先将用户的 `Blue.rar` 解压到自己的素材目录，保留上述 OBJ、MTL 和四张 PNG。压缩包的原始目录无需与团队电脑一致，通过 `--source` 传入即可。

在仓库根目录执行，下面的 `D:\素材\Blue` 应替换为实际解压目录：

```powershell
# 首次使用且尚未安装 Pillow 时执行。
python -m pip install Pillow

python tools/prepare-blue-textures.py --source 'D:\素材\Blue'
& 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe' --background --python tools/build-deepseek-blue.py -- --source 'D:\素材\Blue'
```

贴图脚本只写 `pets/blue-textures/`，不会修改用户源 PNG。Blender 脚本会重写 `pets/deepseek.blend`、`pets/deepseek.glb`、`output/blue-review/build-stats.json` 与检查渲染。需要保留的手工修改应先提交分支或另存工程；脚本不会自动合并已有 `.blend` 中的手工改动。

仅导入、绑定与导出，暂不渲染时使用：

```powershell
& 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe' --background --python tools/build-deepseek-blue.py -- --source 'D:\素材\Blue' --no-render
```

本地网页预览：

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。直接双击 HTML 的 `file://` 方式不能可靠加载 ES module、import map 与 GLB，不用于完整验收。

## 构建统计与验收证据

本轮 [build-stats.json](../output/blue-review/build-stats.json) 记录：

| 项目 | 当前值 |
| --- | --- |
| 原始 OBJ | 499,046 顶点、998,232 三角面 |
| 网页 Blender 网格 | 89,770 顶点、179,680 三角面 |
| 骨骼 / 动作 | 14 根 / `Idle` 4 秒、`React` 2 秒 |
| 网页 GLB | 5,758,428 字节，约 5.8 MB；Draco 压缩 |
| 图像 | 源工程四张 4K；网页三张 2K 内嵌图像 |

Blender 顶点数与 GLB 顶点数不必相同：UV 接缝与法线边界会在导出时拆分顶点。后续修改以重新生成的统计与解码验证为准，不沿用上一轮模型的顶点数、网格数和体积。

本轮 Blender 外观检查文件：

- [正面](../output/blue-review/front.png)
- [侧面](../output/blue-review/side.png)
- [背面](../output/blue-review/back.png)
- [斜侧面](../output/blue-review/three-quarter.png)
- [互动姿态](../output/blue-review/react.png)

这些文件是离线渲染。浏览器验证应另存 `output/playwright/blue-*.png`，记录实际页面、控制台、模型加载、旋转与缩放、点击动作、移动端布局和资源失败回退；上一版 `output/playwright/verification.md` 不能直接作为 Blue 版本测试结论。

数值验证使用 glTF Transform 4.5.0 解码最终 Draco 文件，再通过标准 Python 检查顶点数组、权重和动画。解码中间文件无需额外发布；报告写入 `output/blue-review/validation.json` 并记录两份文件的 SHA-256：

```powershell
npx --yes @gltf-transform/cli@4.5.0 dedup pets/deepseek.glb output/blue-review/deepseek-dedup.glb
python tools/validate-deepseek.py pets/deepseek.glb output/blue-review/deepseek-dedup.glb --output output/blue-review/validation.json
```

## 已知限制

- 原始模型的头发、服装与身体大部分融合在一个连续网格中，当前沿用该拓扑。基础权重适合现有小幅动作，不能据此保证大幅挥手、转身或通用动作库的形变质量。
- 没有嘴型同步、面部表情形态键或表情控制器；眼睛和嘴部不随对话文本独立活动。
- 没有布料、头发物理或实时碰撞解算；头发与尾部动作来自骨骼，不保证任意姿态都无穿插。
- 14 根骨骼服务于两段现有动作，没有完整手指、IK 控制器或人体动作重定向设置。
- 网页副本进行了网格简化和 4K→2K 贴图缩小，细部与原始高面资产存在差异。可编辑工程保留原始数据；尚未制作多档 LOD，约 18 万面的持续帧率仍取决于设备 GPU。
- 原 OBJ 的闭合与边缘检查不等于完成了 3D 打印适配；没有检查打印尺度、壁厚、支撑或材料条件。
- 用户包未附可确认的原作者、生成工具及许可说明，仍需团队补充来源与授权记录，见 [AI 使用与素材记录](AI使用与素材记录.md)。

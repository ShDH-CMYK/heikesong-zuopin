# AI 使用与素材记录

> 作品：潜台词 Subtext · 五只 AI 宠物的内心 OS
>
> 用途：为主办方《AI 工具使用声明表》准备事实记录。提交前由团队逐项复核，不能把“待确认”内容直接当成最终声明。

## 运行时 AI 说明

作品运行时不调用在线大模型或 Agent。回复来自 `game.js` 的本地角色档案、预设话题、关键词匹配和人工编写词库。没有 API Key、没有用户输入上传、没有额度或 429 风险；提示音由浏览器 WebAudio API 实时合成。

| 项目 | 当前事实 |
| --- | --- |
| 运行时在线 AI | 无；回复不调用大模型 |
| 运行时外部接口 | 网页字体可能从 Google Fonts 加载，失败回退系统字体；五角色共用的 Three.js 0.180.0 从本地 `vendor/three/` 加载，按需加载同站点的各角色 GLB；三维加载或渲染失败时保留立绘 |
| 用户输入是否上传 | 否，留在当前页面状态 |
| 运行时密钥 | 无 |
| 音频文件 | 无，实时合成 |

## 开发过程中的 AI 与人工协作

以下表格按仓库、本次协作和你的确认填写。Codex 使用 GPT（具体 GPT 子版本未记录）；立绘生图工具及其版本没有在仓库记录，因此明确写为“未记录”，不以推测代替。

| 环节 | 使用日期 | 工具 / 模型 / 版本 | AI 参与内容 | 人工工作与验证 | 证据位置 |
| --- | --- | --- | --- | --- | --- |
| 需求与交互构思 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录） | 生成候选创意、流程和文案方向 | 你选择“后台吐槽日志”方向，确定赛道二和演示流程 | 本次协作记录；`docs/需求说明.md` |
| HTML/CSS/JS 原型 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录） | 协助生成页面结构、样式、角色逻辑和本地词库 | 你调整视觉层级、角色文案和交互状态；最终代码保存在 Git 提交中 | `index.html`、`styles.css`、`game.js`；Git 历史 |
| QA 与修复 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录）+ Chromium/Playwright 验证 | 协助定位布局、输入、计数、日志和 3D 交互问题，执行回归检查 | 你验收页面行为、五角色外观和交互结果；已有 14 项线上专项检查和 41/41 旧流程回归记录 | `tools/check-pet-interactions.py`、`tools/regression.py`、`output/playwright/` |
| 角色立绘 | 使用日期未记录 | 生图工具与模型版本待团队补填 | 生成五张角色立绘（当前仓库无法证明具体工具、模型或版本） | 你筛选、裁边、统一画布，并负责确认是否可公开使用 | `tools/prep-pets.py`；原始生成记录待补 |
| 拆镜三维资产整理与动画 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录）+ Blender 4.5.10 LTS | 导入用户 `Blue.rar` 的实体网格与既有 UV，统一坐标、重接 PBR 材质、简化网页副本，添加 14 根骨骼、权重与 `Idle` / `React` 小幅动作 | 你提供模型包与使用要求，验收造型和网页效果；原包没有骨骼；不将原网格创作记作本轮 AI 工作 | `tools/build-deepseek-blue.py`、`pets/deepseek.blend`、`output/blue-review/` |
| 拆镜网页贴图处理 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录）+ Python/Pillow（Pillow 版本未记录） | 将用户四张 4K PBR 原贴图制成 2K base color、normal 与 ORM；缩放后归一化法线，按 glTF 通道打包 roughness / metallic | 你提供原图并验收网页效果；原图未改动；不记作本轮从零绘制 | `tools/prepare-blue-textures.py`、`pets/blue-textures/` |
| 文案与词库 | 2026-09-12 至 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录） | 辅助提出吐槽初稿和角色差异化表达 | 你筛选、改写为善意且不针对身份的表达，并确认页面统一使用原创角色名 | `game.js`；Git 历史 |
| 四个角色的三维重建与互动 | 2026-09-13 | Codex（GPT，具体 GPT 子版本未记录）+ Blender 4.5.10 LTS | 按现有立绘的配色、轮廓和特征生成实体几何、材质、部件层级与 `Idle` / `React` 动作，并接入共用 Three.js 渲染器 | 你要求所有角色采用拆镜同款互动，验收旋转、缩放、点击、待机、失败回退和移动端表现 | `tools/build-organic-pets.py`、`tools/build-robot-pets.py`、`pets/organic-pets.blend`、`pets/robot-pets.blend`、`output/all-pets-review/` |

## 创作过程留存

建议至少保存至赛事结束：关键 Prompt、生成时间、模型和版本、Seed、工作流或参数、代码版本、截图和迭代记录。公开仓库只放经整理且有权公开的摘要；完整聊天、真实用户输入、未脱敏截图和账号资料放在仓库外。

## 素材与许可

### 宠物立绘

- 当前页面使用：`pets/doubao.png`（暖球）、`pets/deepseek.png` 及侧视/背视 `pets/deepseek-side.png`、`pets/deepseek-back.png`（拆镜）、`pets/workbuddy.png`（班班）、`pets/codex.png`（报错）、`pets/yuanbao.png`（小金）。文件名是仓库内部资源名，不作为对外角色名。
- 拆镜当前网页模型为 `pets/deepseek.glb`，源工程为 `pets/deepseek.blend`；首次成功绘制三维模型前继续显示立绘，失败时保留立绘。旧 `pets/deepseek-lowpoly.glb`、`pets/deepseek-high-detail.blend`、`pets/deepseek-high-detail.glb` 仅作历史迭代保留。仓库中仍保留旧文件 `pets/diagram-model.png`，页面已不再引用。
- 处理：由 `tools/prep-pets.py` 裁边、补白并统一画布后入库。
- 生成工具、模型、生成日期、原始出处、授权范围：**待团队补填**。
- 页面角色名为原创名「暖球、拆镜、班班、报错、小金」，不对应任何第三方品牌。对外录屏和截图须使用新名，不要出现豆包 / DeepSeek / Codex / 元宝 / WorkBuddy。

### 拆镜三维模型与贴图

- 当前来源：用户提供的 `Blue.rar`，包含 `bcc6d7b2890c0919444227f3cca98e2c.obj`、`material.mtl` 和四张 4096 × 4096 PBR PNG。OBJ 为 499,046 个顶点、998,232 个三角面，已有完整 UV，没有骨骼或动画。原网格与贴图的作者、生成工具、原始出处及授权范围：**待团队补填**；不根据文件名或外观猜测制作平台。
- 本轮处理：AI 辅助编写并运行 Blender Python 脚本，保留用户资产的造型与 UV，统一坐标、计算平滑法线、重接 PBR 材质，为网页简化副本添加骨骼与动画。应称为“用户三维资产整理、绑定与网页适配”，不记作从零雕刻或从零生成角色。
- 当前资产：`pets/deepseek.blend` 保留隐藏的原始高面网格及四张 4K 贴图，并包含网页副本；`pets/deepseek.glb` 使用 179,680 个三角面、14 根骨骼与实际蒙皮权重。`Idle`（4 秒）为轻微呼吸与点头摆动，`React`（2 秒）为点头、微摆和尾部反应；融合拓扑适合小幅动作，没有面部形态键或嘴型同步。
- 网页贴图：`pets/blue-textures/basecolor.jpg`、`normal.png`、`orm.png`，均为 2048 × 2048。normal 在缩放后重新归一化；ORM 红通道为 255（无烘焙 AO），绿通道为原 roughness，蓝通道为原 metallic。三张图内嵌 GLB，Draco 压缩后的模型为 5,758,428 字节，网页无需外链贴图。
- 本轮不修改源包里的四张 4K PNG；贴图处理和格式转换不会自动补足原始设计与资产的授权信息。
- 工具链：Blender 4.5.10 LTS（导入、材质、蒙皮、动画与 glTF 导出）；Python + Pillow（网页贴图处理）；Three.js 0.180.0（网页渲染），详见 [第三方组件与许可声明](../THIRD_PARTY_NOTICES.md)。
- 可复建脚本、UV、骨骼和限制见 [拆镜三维模型说明](DeepSeek三维模型.md)。本轮离线渲染和构建统计位于 `output/blue-review/`，浏览器证据使用 `output/playwright/blue-*.png`；离线渲染本身不代表网页交互测试通过。
- 历史版本：此前按三视图脚本建模、程序绘制虹膜与服装贴图的记录保留在 `tools/build-deepseek.py`、`tools/build-deepseek-textures.py`、`pets/textures/` 和 `output/model-review/`。这些旧脚本不再用于构建当前模型，旧统计与截图不代表 Blue 版本。

### 暖球、班班、报错、小金的三维重建与互动

- 参考来源：本仓库 `pets/doubao.png`、`workbuddy.png`、`codex.png`、`yuanbao.png` 四张立绘。原立绘来源和授权记录仍按上文核验。
- 本轮 AI 工作：Codex 编写 Blender Python 脚本，按立绘的配色、轮廓和特征生成实体几何、材质、部件层级与待机/点击动作。用户要求为所有角色添加拆镜同款互动，AI 代理执行复建、运行集成与自动验证。
- 新网格为程序式风格化重建，背面属于根据轮廓推定的补建；不声称由参考立绘恢复了唯一真实网格，也不声称与 Blue 的高面数/PBR 资产具有相同制作精度。
- 四个角色通过部件节点动画播放 `Idle` / `React`；拆镜继续使用既有骨骼蒙皮。没有新增真人或声音资产、外部模型下载或运行时生成接口。
- 工具与证据：`tools/build-organic-pets.py`、`tools/build-robot-pets.py`、对应 `.blend` 工程、`model3d.js`、`tools/check-pet-interactions.py`、`output/all-pets-review/`。

### 字体、图标与音效

- 字体：页面引用 Google Fonts；使用的具体字体与许可信息需按线上代码复核并记录。
- 图标：内联 SVG；确认是否借鉴开源图标库，若有则补充来源和许可证，否则记录为团队自绘。
- 音效：没有第三方音频文件，由 WebAudio API 实时合成。

### 代码与文案

代码、角色人设和吐槽文案的 AI 参与工具、人工修改范围及版本记录待团队补齐。使用第三方代码、模型、插件或数据集时，记录来源、版本和许可证，并保留必须的署名。

## 提交前核对

- [x] 已按仓库事实和你的确认填写 Codex（GPT）、Blender 4.5.10 LTS、Python/Pillow、Three.js 0.180.0 的用途和分工；Codex 的具体 GPT 子版本、Pillow 版本和立绘生图工具仍明确标为“未记录”，不作猜测。
- [x] 已写清 AI 参与环节，以及你负责的创意定案、素材提供、筛选改写、测试和整合。
- [ ] 五张立绘的来源、生成记录和授权范围已确认。
- [ ] `Blue.rar` 三维网格与四张 PBR 贴图的原作者、来源和使用授权已确认。
- [ ] 对外录屏和截图不含旧品牌名、私人信息、密钥或未授权素材。
- [ ] 任何不确定的版权、品牌或人物问题已在提交前咨询主办方。

# 团队协作约定

以下是本仓库的开发约定，供团队开始协作时使用。具体任务尚待认领；PR 审查和分支约定属于团队做法，不是主办方额外要求。

## 首次准备

1. 接受 GitHub 协作邀请；公开可读不代表已获得写入权限。
2. 克隆仓库。已持有此仓库副本的成员直接使用现有目录，无需重复克隆。

```powershell
git clone https://github.com/ShDH-CMYK/heikesong-zuopin.git weyoung-2026
cd weyoung-2026
```

如果已有仓库副本仍使用旧远程地址，在该副本目录中更新一次：

```powershell
git remote set-url origin https://github.com/ShDH-CMYK/heikesong-zuopin.git
git remote -v
```

## 开始一项任务

先在团队沟通中认领任务，避免同时修改相同文件。下面命令假设工作区干净；有未提交改动时，先检查并提交到自己的分支，再切换。

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feat/your-task
```

把 `your-task` 换成实际任务名。功能使用 `feat/`，修复使用 `fix/`，文档使用 `docs/`。一次分支尽量处理一件可检查的事情。

## 提交与合并

检查 `git diff` 后，使用 `git add 文件路径` 明确选择本次文件；再检查 `git diff --cached` 和 `git diff --cached --check`。确认没有密钥、无关资料或生成的大文件后，执行 `git commit -m "说明具体变化"`，使用 `git push -u origin 分支名` 上传。

在 GitHub 创建以 `main` 为目标的 Pull Request，写清：

- 解决什么问题、用户能完成什么操作；
- 实际做过的验证和结果，没验证的部分如实注明；
- 是否需要新增配置、是否还有已知限制。

由另一位成员检查后合并；如果暂时只有一人可处理，至少自行检查文件差异和验证结果。`main` 尽量保持可使用，已有代码后应在合并前按项目运行说明验证核心流程。

改动 `game.js`、`styles.css`、`index.html` 或 `model3d.js` 后，先起本地服务再跑核心链路回归：

```powershell
python -m http.server 8890 --bind 127.0.0.1
python tools/regression.py http://127.0.0.1:8890/index.html
```

脚本用 Playwright 走一遍选宠物、提问、内心 OS、通敌、对质、清空与窄屏布局，输出每项 PASS/FAIL，全部通过时退出码为 0。需要本机已安装 `playwright` 与 Chromium。

若远程有新提交，先拉取并检查差异。遇到冲突保留双方工作、逐项协调，不使用强制推送覆盖他人提交。依赖锁文件应随依赖修改一同提交。

## 配置与记录

- `.gitignore` 只排除未跟踪文件，不能清除已经提交到历史里的内容。若发现真实密钥曾被提交，先撤销或轮换该密钥，再处理代码和历史中的泄露。
- 使用 API 后再建立 `.env.example`；示例文件仅写配置名称、说明与占位值。不要把服务端密钥写入浏览器代码。
- 按主办方要求维护 [AI 使用与素材记录](docs/AI使用与素材记录.md)（实际使用的工具、人工改动、第三方素材及授权来源）；初稿已建，其中「待补填 / 待确认」事项须在提交前补齐。完整聊天、真实用户资料和未经授权的截图不默认公开。
- 新技术栈确定后补 README、依赖与忽略规则；尚未选择时不预设框架、不创建无用源码目录。

## 本地预览与模型修改

从仓库根目录执行 `python -m http.server 8000 --bind 127.0.0.1`，通过 <http://127.0.0.1:8000/> 预览。三维模块依赖 HTTP 资源加载，直接双击 `index.html` 不作为完整验证方式。普通页面预览不需要 npm 安装或前端构建。

修改拆镜模型（内部资源名 `deepseek`）时保留 `tools/prepare-blue-textures.py`、`tools/build-deepseek-blue.py` 与 `.blend` 源工程。当前造型来自用户提供的 `Blue.rar`，复建需要解压后的 OBJ、MTL 与四张 PBR PNG，通过 `--source` 指定目录；脚本顺序和工具版本见 [模型说明](docs/DeepSeek三维模型.md)。源工程的隐藏 `SOURCE` 集合保留约 100 万面原网格与 4K 贴图，网页副本采用约 18 万面网格、2K 贴图和小幅骨骼动作。修改时保留原始数据及来源说明，记录真实构建统计、四方向渲染、骨骼与动画验证、浏览器交互结果。离线渲染能确认外观，不能证明触摸、点击或资源失败回退已通过。

旧 `tools/build-deepseek.py`、`tools/build-deepseek-textures.py` 和 `pets/textures/` 属于上一轮脚本造型，保留作历史记录；它们会写入相同的最终模型路径，不应再次运行来覆盖 Blue 版本。本轮证据使用 `output/blue-review/` 与 `output/playwright/blue-*.png`，不要把 `output/model-review/` 的旧截图或旧统计当作本轮验证。

## 部署（在线演示）

当前主入口是 Cloudflare Pages 自定义域名 <https://subtext.tryworld.com.cn/>（项目 `subtext`，生产域名 `subtext-8up.pages.dev`）。备用镜像是 GitHub Pages <https://shdh-cmyk.github.io/heikesong-zuopin/>，随 `main` 自动构建；推送成功不等于页面已经更新，要核对线上资源版本。部署后核对 `index.html`、`model3d.js` 与 `pets/deepseek.glb`，并在线验证五个角色的加载、旋转、缩放、点击动作、快速切换和错误回退。

本轮五角色模型更新先在 GitHub Pages 验收；Cloudflare 的五角色版本同步与验证单独记录，不能沿用前一版的同步状态。

部署使用仓库外的**新暂存目录**复制必要静态文件，必须包含 `vendor/three/` 与回复表情所在的 `assets/`：

```powershell
$stageDir = Join-Path (Split-Path -Parent (Get-Location).Path) ('.deploy/subtext-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Force (Join-Path $stageDir 'pets') | Out-Null
Copy-Item index.html,styles.css,game.js,model3d.js,THIRD_PARTY_NOTICES.md -Destination $stageDir
Copy-Item pets\*.png,pets\doubao.glb,pets\deepseek.glb,pets\workbuddy.glb,pets\codex.glb,pets\yuanbao.glb -Destination (Join-Path $stageDir 'pets')
Copy-Item -LiteralPath assets,vendor -Destination $stageDir -Recurse
wrangler pages deploy $stageDir --project-name=subtext --branch=main
```

Three.js 模块依赖关系与 MIT 许可证都在 `vendor/three/` 内，不能只复制 `three.module.js`。`deepseek.glb` 已内嵌网页所需贴图；`.blend`、生成脚本、参考 JPG、构建日志和离线渲染无需上传到 Cloudflare 静态站点。

Cloudflare 部署需要本机已登录（`wrangler whoami` 查看账号）。部署后分别验证两个入口；只有实际更新并检查过的地址才能记为已同步。修改脚本、样式或模型时同步调整引用版本号，避免浏览器旧缓存掩盖更新。

## 五角色互动复建与验证

新增 `tools/build-organic-pets.py` 与 `tools/build-robot-pets.py` 分别制作暖球/小金、班班/报错；Blender 工程分别为 `pets/organic-pets.blend`、`pets/robot-pets.blend`。具体命令、造型限制见 [五角色说明](docs/五角色三维交互.md)。不要用这些脚本覆盖 Blue 源工程。

新增或修改模型需保留 `Idle` 和 `React` 两段动画，并验证在角色切换后停止旧动画、播放新角色动画。运行 `python tools/check-pet-interactions.py http://127.0.0.1:8000/` 检查五角色、缓存、过期请求、失败重试、点击与拖动区别、手机布局和减少动态效果；再运行现有 `tools/regression.py` 检查完整对话流程。使用 Playwright 与 Chromium，验证截图和结果写入 `output/playwright/all-pets/`。

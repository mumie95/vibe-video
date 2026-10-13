# 如果概率有形状 · Vibe 知识大赏

原创数学艺术短片，React + TypeScript + Remotion，1920×1080 / 30 FPS / 900 帧（30 秒）。纯程序化视觉，无外部素材与 API 密钥。此版本无配音和音轨。

## 开发与导出

```bash
npm ci --cache /tmp/vibe-npm-cache
npm run typecheck
npm run preview
npm run render
```

预览命令启动 Remotion Studio。导出命令在项目根目录生成 `output.mp4`（H.264）。系统 Chromium 可用时：

```bash
npm run render -- --browser-executable=/usr/bin/chromium --concurrency=2
npm run still -- --browser-executable=/usr/bin/chromium
```

未安装系统浏览器时使用 `npx remotion browser ensure` 安装 Remotion 支持的 Chrome Headless Shell。中文使用系统 `Noto Serif CJK SC`，请确保该字体可用。预览和渲染使用同一帧驱动动画；粒子种子固定，没有运行时随机数、计时器或网络素材。

## 分镜

| 时间 | 画面 |
| --- | --- |
| 0–5 秒 | 冰蓝与金色粒子从黑暗浮现；开场提问及片名 |
| 5–11 秒 | 4,200 个粒子向重复试验的钟形分布汇聚 |
| 11–18 秒 | 金色高斯曲线逐渐描绘，空间旋转与公式 |
| 18–25 秒 | 镜头沿右尾推进，标记标准正态尾概率约 0.40% |
| 25–30 秒 | 粒子散去，结尾文字与余韵 |

每个粒子的横坐标是 48 次独立均匀试验之和的标准化值，呈近似正态分布；纵向随机填充用于展示密度轮廓。金色曲线与尾部概率标注对应理论标准正态分布，非所有随机过程均必然正态。

## 工程

- `src/index.ts`：Remotion 入口。
- `src/Root.tsx`：分辨率、帧率、总帧数和 Composition 注册。
- `src/ProbabilityFilm.tsx`：确定性采样、Canvas 粒子、SVG 曲线、空间投影与中文排版。
- `remotion.config.ts`：渲染设置。
- `tsconfig.json`：严格 TypeScript 配置。
- `package-lock.json`：锁定依赖版本。

`output.mp4` 与渲染样张不提交 Git。当前云任务已有隔离环境，继续使用本 checkout，无需创建 worktree。

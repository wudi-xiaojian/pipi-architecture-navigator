# 皮皮猴 PiPi · 系统架构导航台 V0.1

一个无依赖、无后台的可交互前端原型，全部中文界面。

## 运行

最简单：直接用浏览器打开 `dist/index.html`。不需要安装软件包或构建。

推荐预览（Node.js 18+）：

```sh
npm start
```

访问 http://127.0.0.1:4173 。可用 `PORT=其他端口 npm start` 更改端口。

## 功能与页面

- 首页项目总览：四端入口、架构层级、模块状态统计。
- 系统总体架构：机器人、小程序 App、皮皮猴云端、外部云端；六组双向数据流。
- 云端内部架构：Gateway、Vision Service、Voice Agent、Activity Engine、Step Manager、Teaching Agent、Agent Core、Knowledge、Memory、User、Device。
- Vision 实现：Object Detection、Tracker、视觉 Activity Engine、VLM Trigger。
- 机器人、App、外部云：各自的内部职责分区。
- 产品概述、产品需求、接口文档、数据模型、开发进度。
- 模块详情侧栏：职责、输入、输出、依赖、子模块、状态、关联项目。
- 点击带“进入”的节点下钻；点击节点右下方文档图标查看职责。普通模块点击查看详情。
- 左侧树形导航可折叠；移动端使用顶部菜单。支持浏览器前进后退、直接定位 hash 路由、键盘操作、Escape 关闭侧栏。
- 四种状态可修改，保存在当前浏览器 localStorage；开发进度页支持恢复示例状态。存储不可用时降级为会话状态。

## 修改与扩展

- `dist/architecture.js`：唯一架构内容入口，集中定义模块、职责、输入输出、依赖、子模块、关联项目与默认状态。
- `dist/app.js`：页面模板、hash 导航、图形布局与交互。增加新的下钻页面时，同时扩展 `navNames`、`paths`、`render` 和导航入口。
- `dist/styles.css`：视觉样式与响应式布局。
- `dist/index.html`：页面入口、元信息与网站图标。
- `server.mjs`：可选本地静态服务。

新增模块可复制一个已有模块对象，使用唯一 ID；依赖引用有效模块 ID，子模块可引用模块 ID 或使用普通文本。无后台、无第三方 CDN，离线也能加载全部界面。

## 数据边界

内容源自“架构图职责说明”V0.1，接口与数据字段为待评审草案。所有开发状态都是演示样例，不能当作真实进度。关联项目是名称映射，尚未绑定真实仓库。需求没有完整验收条件，文档页保留明确待细化提示。

云端 Activity Engine 负责跨模态活动编排，Vision Activity Engine 负责视觉状态与事件。Agent Core 聚合状态、统一决策，不代替各模块的专门职责。

硬件形态待确认：Camera / Microphone / Speaker 可能位于机器人或手机。当前按独立机器人组织。

此版本不连接机器人、实时视频、AI 推理或真实账号，也不提供多人同步编辑。

## 验证

```sh
npm run check
```

状态从默认数据初始化，浏览器本地修改优先。恢复示例状态会删除本原型的 localStorage 键 `pipi-status-v1`，不会操作其他应用的数据。

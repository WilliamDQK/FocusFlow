# FocusFlow

FocusFlow 是一款面向 Windows 11 的 local-first 个人生产力桌面应用。当前版本为 `0.1.2`，已经建立可长期迭代的 React/Tauri/SQLite 基础，并提供可运行的浏览器预览。

## 当前版本包含

- Dashboard、Today、Tasks、Focus、Statistics、Memo、History、Settings 完整页面外壳
- 中文与英文即时切换，浅色、深色与系统主题，可自定义强调色和首页语录
- 任务新建、编辑、软删除、完成/恢复、固定、搜索、筛选与项目/分类/标签
- List、Compact、Card、按项目/分类组织的看板、四象限与九宫格视图
- Pomodoro 与 Stopwatch，暂停/继续/结束/放弃、任务绑定、分段记录
- 用户约定的记录规则：预计时长 5% 门槛，预计超过 2 小时则豁免
- 番茄到点自动延长，默认最多 30 分钟，可配置后自动结束
- 按 20 分钟默认门槛计算连续专注天数
- 原始 Focus Session 作为统计唯一来源
- 支持分类、GFM 待办列表与快捷格式栏的 Markdown 备忘录
- JSON 完整导出/导入、Focus Session CSV 导出、SQLite 数据库备份
- UUID、软删除、版本字段、迁移脚本与 `SyncProvider`/REST 路由抽象
- Windows 系统托盘驻留、托盘恢复/退出、阻止休眠原生命令及任务/计时浮动面板偏好数据模型

## 本地运行

```powershell
npm install
npm run dev
```

浏览器预览使用 `localStorage`，顶部状态会明确显示“浏览器预览数据”。正式 Tauri 桌面运行时会自动切换到 SQLite Repository。

## Windows 桌面构建

需要以下环境：

- Node.js 22+
- Rust stable，至少 1.77.2
- Visual Studio 2022 Build Tools，包含 Desktop development with C++ 与 Windows SDK
- Microsoft Edge WebView2 Runtime

```powershell
npm run tauri dev
npm run tauri build
```

`tauri build` 的目标为当前用户级 NSIS x64 安装程序。数据库默认位于 Tauri 应用数据目录，备份保存在同目录的 `backups` 子目录。

## 质量检查

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

详细的架构、数据库设计、目录职责与后续阶段见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 和 [docs/ROADMAP.md](docs/ROADMAP.md)。

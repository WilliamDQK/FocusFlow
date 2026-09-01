# Development Roadmap

## 0.1.x Foundation（当前）

- [x] Tauri 2 / React / TypeScript / Vite / Tailwind 初始化
- [x] UI shell、routing、主题、中英文
- [x] SQLite schema、migration、Repository 边界
- [x] Task、Project、Category 与五种任务布局
- [x] Pomodoro、Stopwatch、Focus Session 原始记录
- [x] Dashboard、基础 Statistics、History
- [x] Markdown Memo
- [x] JSON 导入导出、CSV 导出、数据库备份
- [x] SyncProvider 与未来 REST 路由定义
- [x] lint、strict typecheck、domain policy tests、production web build

## 0.2.0 Desktop Integration

- [ ] 用独立 Tauri 窗口实现任务面板和计时面板
- [ ] 窗口透明度、桌面层/普通层/始终置顶、位置锁定与靠边吸附
- [ ] 系统托盘、关闭到托盘、Windows 通知、可选声音
- [ ] 用户自定义且默认关闭的全局快捷键
- [ ] 开机启动与锁屏暂停
- [ ] Active timer 从 WebView localStorage 迁移到 SQLite `active_timer_state`

## 0.3.0 Planning and Review

- [ ] 任务手动拖拽排序、分组、显示字段和密度配置 UI
- [ ] 子任务、提醒调度与重复任务下一实例生成
- [ ] Project/Category 独立管理页
- [ ] History 编辑与日期范围筛选
- [ ] Day/Week/Month/Year/Custom Range 完整统计
- [ ] 标签分布、任务排名、Calendar Heatmap 与 CSV 选项

## 0.4.0 Data Hardening

- [ ] 从全量快照事务升级为逐实体 Repository 与 change log
- [ ] 自动备份保留策略、恢复向导、备份完整性校验
- [ ] 导入预览、冲突报告和更细的 schema validation
- [ ] 数据库位置迁移与异常恢复测试

## 0.5.0 Sync-ready

- [ ] `change_log`、设备 ID、同步游标和冲突策略
- [ ] REST API Client 类型与 mock contract tests
- [ ] `CloudSyncProvider` 接入点，仍保持 Local-only 为默认

## Android Track

- [ ] Tauri Android 工程初始化与 SQLite adapter 验证
- [ ] 移动端底部导航、响应式页面与触控任务排序
- [ ] Android 前台计时服务、通知渠道、后台限制与电池策略
- [ ] 共享 domain/service/store 包，Windows native adapter 与 Android adapter 分离

# Render Web 部署说明

这个项目现在已经补好了 Render Blueprint 配置，仓库根目录文件是 [render.yaml](/C:/codex/Joai_app/render.yaml)。

## 部署内容

- FastAPI 后端
- 同站点托管的 Web UI
- 健康检查地址：`/api/health`
- 默认股票池：`GOOGL,META,NVDA,AAPL`
- 默认邮件接收人：`xuboyan0823@gmail.com`

## 部署步骤

1. 把最新代码推到 GitHub。
2. 打开 Render。
3. 选择 `New +` -> `Blueprint`。
4. 连接仓库 `Joe-B-Xu/Joai_app`。
5. Render 会识别仓库根目录的 `render.yaml`。
6. 部署前补齐至少这些密钥：
   - `GEMINI_API_KEY`，或其他可用的 AI Provider Key
   - `EMAIL_SENDER`
   - `EMAIL_PASSWORD`
7. 点击部署。

## 当前启动方式

服务会以 Web 模式启动，不会自动跑定时分析：

```bash
python main.py --serve-only --host 0.0.0.0 --port ${PORT:-10000}
```

## 说明

- 这个服务运行在 monorepo 里的 `daily_stock_analysis` 子目录。
- 持久化磁盘挂载到 `/app/data`，数据库会保存在这里。
- `/app/logs` 和 `/app/reports` 目前还是容器内文件；如果你后面希望长期保留，也可以继续扩展持久化方案。
- 部署完成后可以直接打开 Render 提供的网址访问 Web 版。
- API 文档地址是 `/docs`。

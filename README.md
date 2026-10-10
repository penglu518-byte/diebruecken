# DIE BRÜCKEN / 桥 2027 — 项目网页

中德建交 55 周年 · 中德文化与对话交流季 2027 的策划同步页面（中文 / 德文）。

## 如何更新内容

- 中文：`content/zh.js`
- 德文：`content/de.js`

两个文件结构一一对应。每次调整方案时：

1. 修改对应文字；
2. 更新 `doc.version` 和 `doc.updated`；
3. 在 `changelog.items` 顶部加一条更新记录；
4. 提交并推送到 GitHub，Netlify 会自动重新发布。

`status.items` 是“筹备进度”里的待办事项，`state` 可选 `open`（待决定）/ `progress`（进行中）/ `done`（已确认）。
时间表里的“当前阶段”会根据日期自动高亮。

## 本地预览

```
python3 -m http.server 8642
```

然后打开 http://localhost:8642/?lang=zh 或 ?lang=de。

工作稿阶段页面设置了 noindex（不被搜索引擎收录），正式公开前在 `index.html` 和 `netlify.toml` 中删除即可。

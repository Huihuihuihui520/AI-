# ✅ 手动提交代码到 GitHub（5 分钟）

## 问题诊断
自动化脚本因本环境未安装 Git 而无法运行。但这不影响！你可以通过以下两种方式之一完成提交。

---

## 🚀 方案 A：使用 VS Code 内置 Git（最简单，⭐ 推荐）

### 步骤 1：打开 VS Code
- 打开 VS Code
- 确保已打开项目文件夹 `d:\AI麻醉助手app`

### 步骤 2：打开 Source Control 面板
```
按 Ctrl+Shift+G 或点击左侧的分支图标
```

应该看到：
```
SOURCE CONTROL: Git

Repositories
 📁 AI麻醉助手app

Changes
 ✎ src/App.jsx
 ✎ vite.config.js
```

### 步骤 3：暂存所有修改
**方法 A**：点击 "Changes" 标题旁的 **+** 按钮  
**方法 B**：连续右键点击两个文件，选择 "Stage Changes"

之后应该看到：
```
Staged Changes
 ✎ src/App.jsx
 ✎ vite.config.js
```

### 步骤 4：输入提交信息
在顶部 **Message** 输入框中输入：
```
fix: 强化 API URL 处理防止重复拼接，增强代理日志

修改内容：
- 改进 normalizeUrl() 使用全局正则移除所有末尾的 /chat/completions
- 增强 getApiUrl() 添加 console.debug() 日志便于调试
- 优化 vite.config.js 代理规则的 rewrite 函数和日志

测试验证：
- npm run dev 成功启动于 http://localhost:5173/
- npm run build 成功，无错误输出
- 修改文件：src/App.jsx, vite.config.js
```

### 步骤 5：提交
- 按 `Ctrl+Enter` 或点击上方的 **Commit** 按钮

✅ 本地提交完成！

### 步骤 6：推送到 GitHub
面板右上角或顶部会显示推送选项：
- 点击 **Publish Branch** 或 **Push**
- 或按 `Ctrl+Shift+P`，搜索 "Git: Push"，按 Enter

✅ **完成！代码已推送到 GitHub，GitHub Actions 自动构建 APK**

---

## 🌐 方案 B：使用 GitHub Web 界面（备选）

如果 VS Code Git 有问题，可以直接在网页上编辑和提交：

### 步骤 1：打开 GitHub 仓库
访问：https://github.com/Huihuihuihui520/AI-

### 步骤 2：编辑 `src/App.jsx`
1. 点击 `src/` → `App.jsx`
2. 点击 ✎ （编辑图标）
3. 删除第 245-278 行（旧的 `normalizeUrl()` 和 `getApiUrl()` 函数）
4. 复制下面的新代码并粘贴：

```javascript
// 标准化 URL 辅助函数 (强化逻辑以防重复拼接)
const normalizeUrl = (url) => {
  if (!url) return '';
  
  // 1. 去首尾空格和末尾斜杠
  let cleanBase = url.trim().replace(/\/+$/, '');
  
  // 2. 强制 HTTPS  
  if (!cleanBase.startsWith('http')) {
    cleanBase = 'https://' + cleanBase;
  }
  cleanBase = cleanBase.replace(/^http:\/\//i, 'https://');

  // 3. 移除所有末尾的 /chat/completions（可能多个）
  cleanBase = cleanBase.replace(/\/chat\/completions(\/)*/gi, '');
  
  // 4. 确保最终有且仅有一个 /chat/completions 后缀
  return `${cleanBase}/chat/completions`;
};

// 根据当前环境获取最终请求 URL (用于处理 CORS 代理)
const getApiUrl = (baseUrl) => {
  const normUrl = normalizeUrl(baseUrl);
  console.debug('API URL normalized:', normUrl);
  
  // DashScope 走代理以解决 CORS
  if (normUrl.includes('dashscope.aliyuncs.com')) {
    const proxyUrl = normUrl.replace('https://dashscope.aliyuncs.com', '/api/dashscope');
    console.debug('Using proxy URL:', proxyUrl);
    return proxyUrl;
  }
  
  console.debug('Using direct URL:', normUrl);
  return normUrl;
};
```

5. 底部点击 **Commit changes**
6. 输入提交信息：`fix: 强化 API URL 处理`
7. 点击 **Commit changes** 确认

### 步骤 3：编辑 `vite.config.js`
1. 回到仓库首页
2. 点击 `vite.config.js`
3. 点击 ✎ （编辑图标）
4. 找到第 39-46 行的 `server: { proxy: {` 部分
5. 替换为：

```javascript
  server: {
    proxy: {
      '/api/dashscope': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => {
          // 去掉 /api/dashscope 前缀，保留剩余路径
          const newPath = path.replace(/^\/api\/dashscope/, '');
          console.log('[Vite Proxy]', path, '→', `https://dashscope.aliyuncs.com${newPath}`);
          return newPath;
        }
      }
    }
  }
```

6. 底部点击 **Commit changes**
7. 输入提交信息：`fix: 优化代理日志`
8. 点击 **Commit changes** 确认

✅ **完成！代码已推送到 GitHub，GitHub Actions 自动构建 APK**

---

## 📱 验证 APK 构建

### 实时查看构建进度
1. 打开 https://github.com/Huihuihuihui520/AI-/actions
2. 应该看到新的 "Build Android APK" 任务
3. 等待 10-15 分钟，看到绿色对勾 ✅

### 下载 APK
1. 点击最新的构建任务
2. 向下滚动到 **Artifacts** 部分
3. 点击 `ai-anesthesia-assistant-apk`
4. 下载 `app-debug.apk`

---

## ⚙️ 如果出现问题

### "Push 失败"（认证问题）
**在 VS Code 中**：
1. 按 `Ctrl+Shift+P`
2. 搜索 "Git: Add Remote"
3. 或者：Terminal → New Terminal
4. 运行：`git config user.email "your-email@example.com"`
5. 再运行：`git config user.name "Your Name"`

**使用 GitHub CLI**（最可靠）：
```
winget install GitHub.cli
gh auth login
# 选择 HTTPS，按提示完成授权
```

### "Cannot find file"
检查文件路径是否正确：
- `src/App.jsx` ✅（第 245-278 行）
- `vite.config.js` ✅（第 39-50 行）

---

## 🎯 检查清单

完成以下步骤：

- [ ] 选择方案 A（VS Code）或方案 B（GitHub 网页）
- [ ] 提交 `src/App.jsx` 修改
- [ ] 提交 `vite.config.js` 修改
- [ ] 推送到 GitHub（master 分支）
- [ ] 打开 https://github.com/Huihuihuihui520/AI-/actions
- [ ] 看到新的 "Build Android APK" 任务
- [ ] 等待构建完成（绿色对勾 ✅）
- [ ] 下载 APK 文件

---

## 📞 快速参考

| 需求 | 操作 |
|------|------|
| 查看修改 | Ctrl+Shift+G → Source Control |
| 暂存文件 | 点击 **+** 或右键 Stage Changes |
| 输入信息 | 在 Message 框输入提交信息 |
| 提交 | Ctrl+Enter 或点击 Commit |
| 推送 | Ctrl+Shift+P → Git: Push |
| 查看日志 | Ctrl+Shift+G → Commit History |

---

## 🎉 完成

一旦代码推送到 GitHub，GitHub Actions 会自动：
1. 拉取代码
2. 运行 `npm run build`（Web 构建）
3. 编译 Android APK
4. 上传制品到 Artifacts

**预计时间**：10-15 分钟


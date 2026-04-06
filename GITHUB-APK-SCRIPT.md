# 🚀 一键自动化脚本 - 快速启动指南

## 📝 脚本说明

已为你生成了一个完整的 PowerShell 自动化脚本：**`github-apk-build.ps1`**

**功能**：
- ✅ 检查 Git 是否已安装
- ✅ 自动安装 Git（可选）
- ✅ 提交代码修改到 Git
- ✅ 推送到 GitHub
- ✅ 触发 GitHub Actions 自动构建 APK

---

## 🚀 快速启动（3 步）

### Step 1️⃣：打开 PowerShell**  
```powershell
# 按 Win+X，选择 "Windows PowerShell (管理员)" 或 "Terminal"
```

### Step 2️⃣：进入项目目录
```powershell
cd "d:\AI麻醉助手app"
```

### Step 3️⃣：运行完整脚本
```powershell
.\github-apk-build.ps1 -Full
```

✅ **完成！** 脚本会自动：
1. 检查 Git
2. 暂存修改
3. 提交代码
4. 推送到 GitHub
5. 显示 APK 下载说明

---

## ⚙️ 脚本参数详解

| 参数 | 功能 | 何时使用 |
|------|------|---------|
| `-Full` | 完整流程（检查→提交→推送） | ⭐ **首选** |
| `-CheckGit` | 仅检查 Git 是否已安装 | 第一次运行 |
| `-Install` | 尝试自动安装 Git（Chocolatey） | Git 未安装 |
| `-Commit` | 仅提交代码 | 分步操作 |
| `-Push` | 仅推送到 GitHub | 分步操作 |
| `-Help` | 显示帮助信息 | 需要帮助 |

---

## 🔍 使用场景

### 场景 A：首次运行（推荐）
```powershell
# 一键完成所有步骤
.\github-apk-build.ps1 -Full
```
脚本会自动：
- 检测 Git 是否已安装
- 如果未安装，询问是否安装
- 检查项目状态
- 提交代码
- 推送到 GitHub
- 显示 APK 下载说明

### 场景 B：只想检查 Git
```powershell
.\github-apk-build.ps1 -CheckGit
```
输出示例：
```
✅ Git 已安装：git version 2.43.0.windows.1
```

### 场景 C：Git 未安装，需要自动安装
```powershell
.\github-apk-build.ps1 -Install
```
脚本会尝试用 Chocolatey 安装 Git。

### 场景 D：分步操作（不推荐，容易出错）
```powershell
# 第 1 步：提交
.\github-apk-build.ps1 -Commit

# 第 2 步：推送
.\github-apk-build.ps1 -Push
```

---

## 🛠️ 如何使用脚本

### 方法 1：直接运行（最简单）
```powershell
# 在 PowerShell 中直接输入命令
cd "d:\AI麻醉助手app"
.\github-apk-build.ps1 -Full
```

### 方法 2：在 VS Code 集成终端中运行
1. 在 VS Code 中打开集成终端（Ctrl+`）
2. 输入命令：
```powershell
.\github-apk-build.ps1 -Full
```

### 方法 3：双击运行（可能被系统禁止）
如果遇到 "ExecutionPolicy" 错误，运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📋 脚本执行流程图

```
启动脚本 (.\github-apk-build.ps1 -Full)
    ↓
[Step 1] 检查 Git 
    ├─ Git 已装？→ 继续
    └─ Git 未装？→ 询问是否安装 (Y/N)
    ↓
[Step 2] 检查项目状态
    ├─ 检查 .git 文件夹
    ├─ 显示修改的文件列表
    └─ 显示远程仓库地址
    ↓
[Step 3] 暂存修改文件
    ├─ git add src/App.jsx
    ├─ git add vite.config.js
    └─ 显示将要提交的文件
    ↓
[Step 4] 提交到 Git
    ├─ git commit -m "fix: ..."
    └─ 显示提交哈希
    ↓
[Step 5] 推送到 GitHub
    ├─ git push origin master
    └─ 成功 ✅
    ↓
[Step 6] 显示 APK 下载说明
    ├─ GitHub Actions URL
    ├─ 预计构建时间
    └─ APK 下载位置
    ↓
完成 🎉
```

---

## ⚠️ 可能遇到的错误

### 错误 1：Git 未安装
```
❌ Git 未安装或不在 PATH 中
```
**解决**：
```powershell
# 方案 A：运行脚本让其自动安装（需要 Chocolatey）
.\github-apk-build.ps1 -Install

# 方案 B：手动安装
# 下载：https://git-scm.com/download/win
# 安装后重启 PowerShell
```

### 错误 2：ExecutionPolicy 限制
```
File cannot be loaded because running scripts is disabled on this system.
```
**解决**：
```powershell
# 仅为当前用户临时允许运行本地脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后重新运行脚本
.\github-apk-build.ps1 -Full
```

### 错误 3：推送失败（认证问题）
```
❌ 推送失败
原因可能：
  1. 未设置 GitHub 认证（需要配置 SSH 或 Personal Access Token）
```
**解决**：
1. **方案 A：使用 GitHub CLI**（推荐）
   ```powershell
   winget install GitHub.cli
   gh auth login
   # 按提示选择 HTTPS，用浏览器授权
   ```

2. **方案 B：配置 SSH**
   ```powershell
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # 将生成的公钥添加到 GitHub 账户设置
   ```

3. **方案 C：使用 Personal Access Token**
   - 进入 GitHub → Settings → Developer settings → Personal access tokens
   - 生成新 Token（勾选 repo 权限）
   - 将 Token 用作密码推送时输入

### 错误 4：没有修改的文件
```
❌ 没有检测到修改的文件
```
**检查**：
- 确认 `src/App.jsx` 和 `vite.config.js` 已修改
- 运行 `git status` 查看修改

---

## 📱 APK 获取流程

**脚本运行成功后，按以下步骤获取 APK：**

1. **打开 GitHub Actions 页面**
   ```
   https://github.com/Huihuihuihui520/AI-/actions
   ```

2. **找到最新的构建任务**
   - 应该显示 "Build Android APK"
   - 黄色圆圈 🟡 = 构建中
   - 绿色对勾 ✅ = 构建完成
   - 红色叉 ❌ = 构建失败

3. **等待构建完成（10-15 分钟）**

4. **下载 APK**
   - 点击最新的构建任务
   - 向下滚动到 **Artifacts** 部分
   - 点击 `ai-anesthesia-assistant-apk`
   - 下载 `app-debug.apk`

5. **安装到手机**
   ```powershell
   # 使用 ADB 安装（需连接手机）
   adb install -r app-debug.apk
   
   # 或直接在手机上打开 APK 文件
   ```

---

## ✨ 脚本特色

✅ **完全自动化** — 无需手动输入 Git 命令  
✅ **错误处理** — 自动检测和提示错误  
✅ **彩色输出** — 清晰的进度提示  
✅ **灵活参数** — 支持分步操作  
✅ **自动安装** — 可选自动安装 Git  
✅ **多语言** — 中文提示信息  

---

## 🎯 完整示例

```powershell
# 打开 PowerShell（管理员模式）
cd "d:\AI麻醉助手app"

# 第一次运行时（自动检查 Git、安装（如需）、提交、推送）
.\github-apk-build.ps1 -Full

# 输出示例
╔════════════════════════════════════════════════════════════╗
║  AI 麻醉助手 - GitHub 提交 & APK 构建自动化脚本             ║
╚════════════════════════════════════════════════════════════╝

🔍 检查 Git 是否已安装...
✅ Git 已安装：git version 2.43.0.windows.1

📂 检查项目状态...
✅ 项目有效，已检测到修改：
 M src/App.jsx
 M vite.config.js

📡 远程仓库：https://github.com/Huihuihuihui520/AI-.git

📝 执行 Git 提交...
暂存修改文件...
📋 将要提交的内容：
M  src/App.jsx
M  vite.config.js

提交中...
[master abc1234] fix: 强化 API URL 处理防止重复拼接，增强代理日志
 2 files changed, 15 insertions(+), 8 deletions(-)

✅ 提交成功！

🚀 推送到 GitHub...
当前分支：master
推送中...
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 567 bytes | 567.00 B/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To https://github.com/Huihuihuihui520/AI-.git
   xyz9999..abc1234  master -> master

✅ 推送成功！

╔════════════════════════════════════════════════════════════╗
║                  ✅ 代码已推送到 GitHub                     ║
╚════════════════════════════════════════════════════════════╝

📱 APK 构建已自动触发！

📊 实时查看构建进度：
  🔗 https://github.com/Huihuihuihui520/AI-/actions

⏱️ 预计构建时间：10-15 分钟

📥 APK 下载位置：
  1. 打开上述链接
  2. 找到最新的 'Build Android APK' 任务（绿色对勾 ✅）
  3. 向下滚动到 Artifacts 部分
  4. 点击 'ai-anesthesia-assistant-apk' 下载 app-debug.apk

🎉 完成！您的代码现在在 GitHub 上构建 APK。
```

---

## 📞 获得帮助

**查看脚本帮助信息**：
```powershell
.\github-apk-build.ps1 -Help
```

**查看完整 GitHub Actions 日志**：
1. 打开 https://github.com/Huihuihuihui520/AI-/actions
2. 点击最新构建，查看每个步骤的详细日志
3. 如果构建失败，查看错误信息进行排查


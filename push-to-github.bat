@echo off
REM AI 麻醉助手 - GitHub 提交和推送脚本
REM 用途：一键提交修改代码到 GitHub 并触发 APK 自动构建

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  AI 麻醉助手 - GitHub 提交 ^& 推送脚本                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 设置项目路径
set PROJECT_ROOT=d:\AI麻醉助手app
cd /d "%PROJECT_ROOT%"

REM Step 1: 检查 Git
echo [1/5] 检查 Git 是否已安装...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Git 未安装或不在 PATH 中
    echo.
    echo 请访问以下链接安装 Git：
    echo   https://git-scm.com/download/win
    echo.
    echo 或使用以下命令（需要管理员权限和 Chocolatey）：
    echo   choco install git.install -y
    echo.
    pause
    exit /b 1
)
echo ✅ Git 已安装

REM Step 2: 检查 Git 状态
echo.
echo [2/5] 检查项目 Git 状态...
git status --short
if %errorlevel% neq 0 (
    echo.
    echo ❌ 不是有效的 Git 仓库或没有修改的文件
    echo.
    pause
    exit /b 1
)

REM Step 3: 暂存并显示修改
echo.
echo [3/5] 暂存修改的文件...
git add src/App.jsx vite.config.js
if %errorlevel% neq 0 (
    echo ❌ 暂存文件失败
    pause
    exit /b 1
)

echo 📋 将要提交的文件：
git diff --cached --name-status

REM Step 4: 提交
echo.
echo [4/5] 提交到 Git...
git commit -m "fix: 强化 API URL 处理防止重复拼接，增强代理日志

修改内容：
- 改进 normalizeUrl() 使用全局正则移除所有末尾的 /chat/completions
- 增强 getApiUrl() 添加 console.debug() 日志便于调试
- 优化 vite.config.js 代理规则的 rewrite 函数和日志

测试验证：
- npm run dev 成功启动于 http://localhost:5173/
- npm run build 成功，无错误输出
- 修改文件：src/App.jsx, vite.config.js"

if %errorlevel% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)
echo ✅ 提交成功！

REM Step 5: 推送
echo.
echo [5/5] 推送到 GitHub...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 可能原因：
    echo   1. 未设置 GitHub 认证（需要配置 SSH 或 Personal Access Token）
    echo   2. 网络连接问题
    echo.
    pause
    exit /b 1
)
echo ✅ 推送成功！

REM 显示完成信息
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  ✅ 代码已推送到 GitHub                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📱 APK 构建已自动触发！
echo.
echo 📊 实时查看构建进度：
echo   🔗 https://github.com/Huihuihuihui520/AI-/actions
echo.
echo ⏱️  预计构建时间：10-15 分钟
echo.
echo 📥 APK 下载位置：
echo   1. 打开上述链接
echo   2. 找到最新的 'Build Android APK' 任务（绿色对勾 ✅）
echo   3. 向下滚动到 Artifacts 部分
echo   4. 点击 'ai-anesthesia-assistant-apk' 下载 app-debug.apk
echo.
echo 🎉 完成！您的代码现在在 GitHub 上构建 APK。
echo.
pause

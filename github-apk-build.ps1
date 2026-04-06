#!/usr/bin/env powershell
# AI 麻醉助手 - GitHub 提交 + APK 构建自动化脚本
# 用途：一键提交修改代码到 GitHub 并触发 APK 自动构建
# 作者：automated script
# 更新：2026-04-06

param(
    [switch]$Full
)

$ProjectRoot = "d:\AI麻醉助手app"
$GitBranch = "master"
$CommitMessage = "fix: 强化 API URL 处理防止重复拼接，增强代理日志

修改内容：
- 改进 normalizeUrl() 使用全局正则移除所有末尾的 /chat/completions
- 增强 getApiUrl() 添加 console.debug() 日志便于调试
- 优化 vite.config.js 代理规则的 rewrite 函数和日志

测试验证：
- npm run dev 成功启动于 http://localhost:5173/
- npm run build 成功，无错误输出（1634 modules transformed）
- 修改文件：src/App.jsx, vite.config.js"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  AI 麻醉助手 - GitHub 提交 & APK 构建自动化脚本             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 函数：检查 Git 是否已安装
# ============================================================================
function Check-GitInstallation {
    Write-Host "🔍 检查 Git 是否已安装..." -ForegroundColor Yellow
    try {
        $gitVersion = (git --version 2>&1)
        Write-Host "✅ Git 已安装：$gitVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Git 未安装或不在 PATH 中" -ForegroundColor Red
        Write-Host ""
        Write-Host "解决方案 1：安装 Git For Windows" -ForegroundColor Yellow
        Write-Host "  下载地址：https://git-scm.com/download/win" -ForegroundColor Cyan
        Write-Host "  安装后重启 PowerShell" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "解决方案 2：使用 Chocolatey 一键安装" -ForegroundColor Yellow
        Write-Host "  choco install git.install -y" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "解决方案 3：使用 Windows Package Manager" -ForegroundColor Yellow
        Write-Host "  winget install -e --id Git.Git" -ForegroundColor Cyan
        Write-Host ""
        return $false
    }
}

# ============================================================================
# 函数：自动安装 Git（使用 Chocolatey）
# ============================================================================
function Install-GitAutomatically {
    Write-Host "🔧 尝试自动安装 Git..." -ForegroundColor Yellow
    
    # 检查 Chocolatey
    $chocoExists = (Get-Command choco -ErrorAction SilentlyContinue) -ne $null
    if (-not $chocoExists) {
        Write-Host "⚠️  Chocolatey 未安装，无法自动安装 Git" -ForegroundColor Yellow
        Write-Host "请手动安装 Git 并重启 PowerShell：https://git-scm.com/download/win" -ForegroundColor Cyan
        return $false
    }
    
    Write-Host "安装 Git.Install..." -ForegroundColor Cyan
    try {
        choco install git.install -y
        Write-Host "✅ Git 安装成功！" -ForegroundColor Green
        Write-Host "🔄 请重启 PowerShell 后重新运行脚本" -ForegroundColor Yellow
        return $true
    } catch {
        Write-Host "❌ 自动安装失败：$($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# 函数：检查项目状态
# ============================================================================
function Check-ProjectStatus {
    Write-Host "📂 检查项目状态..." -ForegroundColor Yellow
    
    if (-not (Test-Path $ProjectRoot)) {
        Write-Host "❌ 项目目录不存在：$ProjectRoot" -ForegroundColor Red
        return $false
    }
    
    Set-Location $ProjectRoot
    
    # 检查 .git 目录
    if (-not (Test-Path ".git")) {
        Write-Host "❌ 不是有效的 Git 仓库" -ForegroundColor Red
        return $false
    }
    
    # 检查修改文件
    $status = git status --short 2>&1
    if (-not $status) {
        Write-Host "❌ 没有检测到修改的文件" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ 项目有效，已检测到修改：" -ForegroundColor Green
    Write-Host $status -ForegroundColor Cyan
    Write-Host ""
    
    # 检查远程仓库
    $remote = git config --get remote.origin.url
    Write-Host "📡 远程仓库：$remote" -ForegroundColor Cyan
    
    return $true
}

# ============================================================================
# 函数：执行 Git 提交
# ============================================================================
function Commit-Changes {
    Write-Host ""
    Write-Host "📝 执行 Git 提交..." -ForegroundColor Yellow
    
    Set-Location $ProjectRoot
    
    # 暂存修改的文件
    Write-Host "暂存修改文件..." -ForegroundColor Cyan
    git add src/App.jsx vite.config.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 暂存文件失败" -ForegroundColor Red
        return $false
    }
    
    # 显示将要提交的内容
    Write-Host "📋 将要提交的内容：" -ForegroundColor Cyan
    git diff --cached --name-status
    
    Write-Host ""
    Write-Host "📝 提交信息：" -ForegroundColor Cyan
    Write-Host $CommitMessage -ForegroundColor Gray
    Write-Host ""
    
    # 执行提交
    Write-Host "提交中..." -ForegroundColor Cyan
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 提交成功！" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ 提交失败" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# 函数：推送到 GitHub
# ============================================================================
function Push-ToGitHub {
    Write-Host ""
    Write-Host "🚀 推送到 GitHub..." -ForegroundColor Yellow
    
    Set-Location $ProjectRoot
    
    # 检查分支
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host "当前分支：$currentBranch" -ForegroundColor Cyan
    
    # 推送
    Write-Host "推送中..." -ForegroundColor Cyan
    git push origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 推送成功！" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ 推送失败" -ForegroundColor Red
        Write-Host "原因可能：" -ForegroundColor Yellow
        Write-Host "  1. 未设置 GitHub 认证（需要配置 SSH 或 Personal Access Token）" -ForegroundColor Cyan
        Write-Host "  2. 网络连接问题" -ForegroundColor Cyan
        Write-Host "  3. 分支冲突" -ForegroundColor Cyan
        return $false
    }
}

# ============================================================================
# 函数：显示 GitHub Actions 信息
# ============================================================================
function Show-GitHubActionsInfo {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  ✅ 代码已推送到 GitHub                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK 构建已自动触发！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 实时查看构建进度：" -ForegroundColor Yellow
    Write-Host "  🔗 https://github.com/Huihuihuihui520/AI-/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏱️ 预计构建时间：10-15 分钟" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📥 APK 下载位置：" -ForegroundColor Yellow
    Write-Host "  1. 打开上述链接" -ForegroundColor Cyan
    Write-Host "  2. 找到最新的 'Build Android APK' 任务（绿色对勾 ✅）" -ForegroundColor Cyan
    Write-Host "  3. 向下滚动到 Artifacts 部分" -ForegroundColor Cyan
    Write-Host "  4. 点击 'ai-anesthesia-assistant-apk' 下载 app-debug.apk" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================================
# 函数：显示帮助信息
# ============================================================================
function Show-Help {
    Write-Host "用法：" -ForegroundColor Yellow
    Write-Host "  .\github-apk-build.ps1 [参数]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "参数：" -ForegroundColor Yellow
    Write-Host "  -CheckGit     检查 Git 是否已安装" -ForegroundColor Cyan
    Write-Host "  -Install      自动安装 Git（需要 Chocolatey）" -ForegroundColor Cyan
    Write-Host "  -Commit       执行 Git 提交" -ForegroundColor Cyan
    Write-Host "  -Push         推送到 GitHub" -ForegroundColor Cyan
    Write-Host "  -Full         完整流程（检查 Git → 提交 → 推送）" -ForegroundColor Cyan
    Write-Host "  -Help         显示此帮助信息" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "示例：" -ForegroundColor Yellow
    Write-Host "  # 完整流程" -ForegroundColor Green
    Write-Host "  .\github-apk-build.ps1 -Full" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  # 检查 Git" -ForegroundColor Green
    Write-Host "  .\github-apk-build.ps1 -CheckGit" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  # 只提交代码" -ForegroundColor Green
    Write-Host "  .\github-apk-build.ps1 -Commit" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================================
# 主程序流程
# ============================================================================

if ($CheckGit) {
    # 只检查 Git
    Check-GitInstallation
    exit
}

if ($Install) {
    # 尝试安装 Git
    if (-not (Check-GitInstallation)) {
        Install-GitAutomatically
    }
    exit
}

if ($Commit -and -not $Push) {
    # 只提交
    if (-not (Check-GitInstallation)) {
        Write-Host "❌ Git 未安装，无法继续" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Check-ProjectStatus)) {
        exit 1
    }
    
    if (Commit-Changes) {
        Write-Host "✅ 代码已提交，现在可以运行 '.\github-apk-build.ps1 -Push' 来推送" -ForegroundColor Green
    }
    exit
}

if ($Full) {
    # 完整流程
    Write-Host "启动完整流程..." -ForegroundColor Yellow
    Write-Host ""
    
    # Step 1: 检查 Git
    if (-not (Check-GitInstallation)) {
        Write-Host ""
        Write-Host "是否现在安装 Git？(Y/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq 'Y' -or $response -eq 'y') {
            if (-not (Install-GitAutomatically)) {
                Write-Host "⚠️  安装失败，请手动安装后重试" -ForegroundColor Yellow
                exit 1
            }
            Write-Host "🔄 请重启 PowerShell 后重新运行脚本" -ForegroundColor Yellow
            exit
        } else {
            Write-Host "❌ 无法继续（Git 必需）" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
    
    # Step 2: 检查项目状态
    if (-not (Check-ProjectStatus)) {
        exit 1
    }
    
    # Step 3: 提交
    if (-not (Commit-Changes)) {
        exit 1
    }
    
    # Step 4: 推送
    if (-not (Push-ToGitHub)) {
        exit 1
    }
    
    # Step 5: 显示 APK 信息
    Show-GitHubActionsInfo
    
    Write-Host "🎉 完成！您的代码现在在 GitHub 上构建 APK。" -ForegroundColor Green
    exit 0
}

if ($Push) {
    # 只推送
    if (-not (Check-GitInstallation)) {
        Write-Host "❌ Git 未安装，无法继续" -ForegroundColor Red
        exit 1
    }
    
    if (Push-ToGitHub) {
        Show-GitHubActionsInfo
    }
    exit
}

# 默认：显示帮助并运行完整流程
if ($args.Count -eq 0 -and -not $Full -and -not $Commit -and -not $Push -and -not $CheckGit -and -not $Install) {
    Write-Host "ℹ️  未指定参数，运行完整流程..." -ForegroundColor Cyan
    Write-Host ""
    & $PSCommandPath -Full
    exit
}

Show-Help

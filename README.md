# 🐍 贪吃蛇 (Snake Game)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

一个极具现代感和科技风格的网页版贪吃蛇游戏。采用深海蓝背景、霓虹光效和毛玻璃拟态设计，为您带来沉浸式的游戏体验。

![游戏演示](screenshots/demo.png)

## ✨ 特色功能

- **🌌 沉浸视觉**：深色海洋蓝背景(#0f172a)，搭配动态漂浮的青色与紫红色发光球体，营造深夜科技氛围。
- **💎 玻璃拟态**：界面采用 `backdrop-filter: blur(12px)` 毛玻璃效果，不仅通透且极具质感。
- **🔐 用户系统**：基于 LocalStorage 的轻量级用户系统，自动保存登录状态。
- **📊 智能记录**：实时追踪最高分、历史得分和登录时间，每一次突破都被铭记。
- **🕹️ 丝滑操控**：优化的 Canvas 渲染引擎，按键响应迅速，支持暂停/继续。

## 🛠️ 技术实现

本项目采用纯原生技术栈开发，无任何第三方库依赖：

- **HTML5**：语义化结构，Canvas 游戏画布。
- **CSS3**：
  - CSS Variables 全局变量管理
  - Flexbox 响应式布局
  - CSS Animations 呼吸与漂浮动画
  - 渐变文字与霓虹阴影效果
- **JavaScript (ES6+)**：
  - 面向对象编程 (OOP)
  - 模块化架构 (`game.js`, `auth.js`, `storage.js`)
  - LocalStorage 数据持久化

## 📂 目录结构

```
primordial-planetary/
├── index.html          # 游戏入口与界面结构
├── css/
│   └── style.css       # 400+行精心调教的样式代码
├── js/
│   ├── auth.js         # 用户认证与界面交互逻辑
│   ├── game.js         # 贪吃蛇核心游戏引擎
│   └── storage.js      # 数据存储管理模块
└── screenshots/
    └── demo.png        # 演示截图
```

## 🚀 快速开始

无需安装任何依赖，开箱即用：

1. 克隆或下载本项目到本地。
2. 双击打开 `index.html` 文件。
3. 输入任意用户名登录。
4. 点击 **"开始游戏"** 即可体验！

## 🎮 操作指南

| 按键 | 功能 |
|:---:|---|
| **↑ / W** | 向上移动 |
| **↓ / S** | 向下移动 |
| **← / A** | 向左移动 |
| **→ / D** | 向右移动 |
| **空格 Space** | 暂停 / 继续 |

---

*Enjoy the game!*

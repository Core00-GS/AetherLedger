# Aether Ledger (エーテル帳簿) 🌌
> **Secure. Private. Cyberpunk. Gamified.**

Aether Ledger 是一款植根於 **賽博龐克 (Cyberpunk)** 美學的高安全性、**遊戲化個人財務管理工具**。它結合了頂尖的 Web 加密技術與極致的日系動漫像素藝術，為追求數據主權與理財趣味性的用戶打造了一個能培育虛擬居所的「數據堡壘」。

---

## 🌟 核心理念與遊戲化機制

在一成不變的枯燥記賬中，我們引入了 **"Frugal-Quest" 智能等級系統**：
- 🎮 **越檢約越強大**：誠實記賬與控制支出能為你賺取 **EXP (經驗值)**。
- 🪙 **以太金幣收成**：每月保持高額儲蓄率、或預算管理極佳時，每日可在「以太家園」中領取由理財紀律產出的 **Aether Coins**。
- 🏠 **構築專屬庇護所**：利用賺取的貨幣，解鎖並定制多款賽博太空豪宅。在 3D Isometric（等軸測測量視圖）中自由購置、佈局並擺放各種日系二次元與科幻風格傢俱。

---

## 🚀 特色功能

### 🕹️ 以太家園 3D 空間 (Sanctuary Mode)
- **等距 3D 渲染視鏡**：基於精密幾何公式運算（1:2 等半軸比），實現極致流暢的三維像素平面化佈局。
- **全息裝修工具箱**：傢俱擺放支持實體拖放、90度空間旋轉（RotateCw）、重構回歸背包（Deconstruct）與智能防碰撞檢測。
- **太空地產與裝潢庫**：
  - **京都微型太空艙 (Capsule Suite)**: 6x6 預置小型安全屋。
  - **秋葉原御宅工作室 (Otaku Lab)**: 8x8 科技狂人創作室。
  - **外太過浮空島別墅 (Aether Penthouse)**: 10x10 超凡大空間。
  - **炫彩裝飾實體**: 量子暖桌、離子劍、低溫睡眠艙、初音歌姬投影機、高維盆栽等，均附帶精美的微光呼吸動畫。

### 🏦 核心財務防衛
- **全能數據分析**：支出佔比餅圖（Pie Chart）、最近收支動態，以及最新的 **12 個月預算執行 Area Trend Chart**。
- **全域本地防護**：極致本地保存，所有財務報表數據與家園佈置記錄，均通過 **AES-256-GCM** 和 **PBKDF2** 主金鑰本地加密。
- **雙重安全屏障**：在清除數據、重置密碼或導出 JSON 時加入主密碼二次動態審查，為財務增添保險。

---

## 🛠️ 技術棧 (Tech Stack)

- **Runtime**: [TypeScript](https://www.typescriptlang.org/)
- **Frontend**: [React 18+](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **3D Isometric Engine**: Custom SVG Geometry Coordinate Matrix
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Encryption**: Standard Web Crypto API (AES-256)

---

## 💻 本地環境搭建

```bash
# 1. 克隆代碼
git clone <repository-url>

# 2. 進入目錄
cd aether-ledger

# 3. 安裝依賴
npm install

# 4. 啟動賽博開發伺服器
npm run dev
```
隨後在瀏覽器訪問 `http://localhost:3000` 即可解鎖。

---

## 🔮 未來展望 (Next Horizons)

- [ ] **全息寵物喂食系統**：通過完成每日連續儲蓄任務獲得飼料，餵養一隻精緻的 AI 二次元像素小電子。
- [ ] **動能匯率接口**：支持跨星系貨幣（多幣種）的動態轉換結算。
- [ ] **PWA 部署裝載**：支持在 Android/iOS 下直接桌面上載使用。

---

⚠️ **密鑰遺忘免責清單**：
由於系統採用本地軍工加密防禦且無後端備份存儲，**我們無法尋回因丟失主密碼而加密的數據遺址**。請妥善記錄並備份導出您的 JSON 文件！

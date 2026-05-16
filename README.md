# Aether Ledger (エーテル帳簿) 🌌
> **Secure. Private. Cyberpunk.**

Aether Ledger 是一款植根於 **賽博龐克 (Cyberpunk)** 美學的高安全性個人財務管理工具。它結合了頂尖的 Web 技術與強大的本地加密技術，旨在為追求極致隱私與視覺體驗的用戶提供一個絕對私密的「數據堡壘」。

---

## 🌟 核心理念

在數據即資產的時代，**Aether Ledger** 堅持 **"Your Data, Your Keys"**。我們提供不僅僅是記賬，而是一種對個人數據主權的守護。

- 🔒 **軍工級防護**：採用 **AES-256-GCM** 加密與 **PBKDF2** 密鑰解析，確保數據在本地也是不可破解的。
- 🕵️ **零追蹤設計**：無雲端同步、無外部 API 調用、無跟蹤器。您的數據永遠不會離開您的瀏覽器。
- ⚡ **極速交互**：基於 React + Vite + Tailwind CSS 構建，配合 Framer Motion 實現流暢的賽博交互。

---

## 🚀 特色功能

### 🏦 核心財務模塊
- **全能入賬**：支持收入、支出分類，內置智能彙總與餘額即時計算。
- **自動化循環**：內置循環交易引擎，支持設置每日/週/月/年的自動入賬，並可設定**自動停止日期**。
- **預算守衛**：針對不同類別設定月度預算，實時圖形化顯示執行進度與餘額。

### 📊 深度數據洞察
- **年度趨勢分析**：全新的年度 Area Chart 視圖，展現過去 6-12 個月的收支平衡動態。
- **類別佔比**：直觀的 Pie Chart 展示消費結構，幫助優化支出。
- **複合搜索引擎**：支持按類別、描述、日期區間進行秒級篩選。

### 🎨 極致個性化
- **樣式引擎**：自由定義每個類別的專屬**十六進制顏色**。
- **圖標庫**：為不同類別指定專屬圖標（如 Coffee, Car, Zap 等），在流水與報表中直觀呈現。

### 🛡️ 數據遷移與安全
- **遷移嚮導 (Wizard)**：內置步驟式腳本引導，讓加密數據的導入與導出變得輕鬆而專業。
- **敏感動作二次認證**：導出備份、清除內存或修改核心設置時，需進行**主密碼二次驗證**，防止誤操作。

---

## 🛠️ 技術棧

- **Runtime**: [TypeScript](https://www.typescriptlang.org/)
- **Frontend**: [React 18+](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Encryption**: [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## 💻 本地環境搭建

如果您想在本地克隆並運行本項目：

```bash
# 1. 克隆代碼
git clone <repository-url>

# 2. 進入目錄
cd aether-ledger

# 3. 安裝依賴
npm install

# 4. 啟動開發伺服器
npm run dev
```
訪問控制台輸出的地址（通常為 `http://localhost:3000`）。

---

## 🔮 未來展望 (Next Horizons)

- [ ] **多幣種自動結算**：整合實時匯率 API。
- [ ] **AI 語義入賬**：利用 WebLLM 實現本地語音/文本智能分類。
- [ ] **PWA 部署**：支持桌面與移動端的離線安裝體驗。
- [ ] **消費預警**：利用統計學模型預測超支風險。

---

⚠️ **安全警告**：
由於本系統採用底層加密且無後端存儲，**我們無法恢復您丟失的主密碼**。請務必將密碼與導出的備份文件分開妥善保存。數據一旦丟失，神靈也無法復原。

> **"In Aether, we trust our own keys."**

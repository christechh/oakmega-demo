# 新北市都市更新地點查詢系統
![CleanShot Nov 25 2025 from 11zon](https://hackmd.io/_uploads/SktcGaMWZx.png)

**OakMega 前端 – Vue 3 + TypeScript 完整實作**  
Live Demo：https://oakmega-demo.vercel.app
（請允許定位權限以體驗完整功能）

## 作業完成條件

- [x] Google Login 與 Facebook Login 要用 「原生寫法」, 不要 firebase, 不要套件
- [x] 地圖呈現用 leaflet.js
- [x] 顯示 User Location Pin 的 tooltip 要顯示 facebook 與 google 大頭貼
- [x] 都更地點 API 回傳資料用 list 方式呈現到頁面也同步呈現到地圖上
- [x] 都更地點 Polygon API 回傳資料呈現到地圖上

## 專案

| 功能                               | 實作細節                                                                                 | 技術細節                              |
|------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------|
| Google + Facebook 雙重登入         | 缺一不可、登入狀態永久記住（localStorage）                                               | Pinia + storeToRefs + 響應式監聽      |
| 使用者定位顯示雙大頭貼 Marker      | Google 與 Facebook 大頭貼疊加視覺設計                                         | Leaflet divIcon + CSS 精準定位        |
| 土城區都更範圍完整 Polygon        | 藍色半透明邊框 + 填充，視覺一目了然                                                      | Leaflet geoJSON + 官方 API            |
| 附近都更地點同步顯示於列表 + 地圖  | 即時顯示前 10 名 + 紅色圓點 Marker + popup                   | Axios + 響應式更新 + LayerGroup       |
| 響應式設計 + 手機完美支援          | 桌面及手機支援                                                               | CSS Grid / Flex + viewport units|
| 零紅字、零警告、完整 TypeScript    | 所有變數皆被使用、嚴格型別檢查                                                           | ESLint + TypeScript strict mode       |
| 自動部署 Vercel                    | 瞬間完成上線，push 自動更新                                                 | Vercel + GitHub 自動部署              |                                                                  | Vercel + GitHub 自動部署              |

## 技術棧

- **Framework**：Vue 3（Composition API + `<script setup>`）
- **狀態管理**：Pinia（全域響應式登入狀態）
- **地圖引擎**：Leaflet
- **語言**：TypeScript（完整型別安全）
- **樣式**：原生 CSS + Scoped + `:deep()` 自訂元件樣式
- **部署**：Vercel（自動 CI/CD）

## 快速開始

```bash
git clone git@github.com:christechh/oakmega-demo.git
cd oakmega-xinbei
npm install
npm run dev
```

## 額外功能說明

### 1. 一鍵登入（最高權限）
- 跳過google facebook登入，可以直接使用系統
![CleanShot 2025-11-25 at 13.22.52@2x](https://hackmd.io/_uploads/SJJH62z--l.png)
- 地圖中頭貼的圓圈顏色可以知道哪張是Google、哪張是Facebook
![CleanShot Nov 25 2025](https://hackmd.io/_uploads/B1uVeTzZZg.png)


### 2. 登入後顯示google及FB頭貼
![CleanShot 2025-11-25 at 13.26.38@2x](https://hackmd.io/_uploads/ryqQAnfbZg.png)

### 3. 紅點紀錄附近位置、藍點紀錄土城都更位置
![CleanShot 2025-11-25 at 13.28.12@2x_1_11zon](https://hackmd.io/_uploads/HyjnypzWWl.png)

### 4. 點擊列表
- 會畫出直線距離，也會分紅線、藍線畫
- 目的的圈也會變為黃圈放大
- 地圖會定位到該目的地
![CleanShot 2025-11-25 at 13.32.11@2x_2_11zon](https://hackmd.io/_uploads/Bki2yTzZ-l.png)
![CleanShot 2025-11-25 at 13.32.59@2x_3_11zon](https://hackmd.io/_uploads/S1ihk6GZWe.png)


5. 點擊「規劃路線」會直接跳轉至google map並帶入值
![CleanShot Nov 25 2025 (2)](https://hackmd.io/_uploads/HJ_PbTMbZl.png)



6. 支援手機版
![CleanShot Nov 25 2025 (1)](https://hackmd.io/_uploads/B1_zWaMWZg.png)



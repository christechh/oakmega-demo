# 新北市都市更新地點查詢系統

**OakMega 前端作業 – Vue 3 + TypeScript 完整實作**  
Live Demo：https://oakmega-demo.vercel.app
（請允許定位權限以體驗完整功能）

## 專案

| 功能                               | 實作細節                                                                                 | 技術細節                              |
|------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------|
| Google + Facebook 雙重登入         | 缺一不可、登入狀態永久記住（localStorage）                                               | Pinia + storeToRefs + 響應式監聽      |
| 使用者定位顯示雙大頭貼 Marker      | Google 與 Facebook 大頭貼疊加，最吸睛的視覺設計                                         | Leaflet divIcon + CSS 精準定位        |
| 土城區都更範圍完整 Polygon        | 紅色半透明邊框 + 填充，視覺一目了然                                                      | Leaflet geoJSON + 官方 API            |
| 附近都更地點同步顯示於列表 + 地圖  | 點擊「查詢附近都更地點」→ 即時顯示前 10 名 + 紅色圓點 Marker + popup                   | Axios + 響應式更新 + LayerGroup       |
| 響應式設計 + 手機完美支援          | 無論桌面或手機皆可流暢使用                                                               | CSS Grid / Flex + viewport units      |
| 開發者一鍵登入（方便 demo）        | 開發環境點一下橘色按鈕即可跳過登入，直接展示全部功能                                     | import.meta.env.DEV 條件渲染          |
| 零紅字、零警告、完整 TypeScript    | 所有變數皆被使用、嚴格型別檢查                                                           | ESLint + TypeScript strict mode       |
| 自動部署 Vercel                    | 30 秒完成上線，push 自動更新                                                 | Vercel + GitHub 自動部署              |                                                                  | Vercel + GitHub 自動部署              |

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
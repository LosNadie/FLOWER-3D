# FLOWER 3D

一个基于 Three.js 的 3D 互动花束网页，支持鼠标拖拽旋转，使用粉色流光背景与动态灯光营造视觉氛围。

## 在线预览

- Vercel: [https://flower-3d-losnadie.vercel.app](https://flower-3d-losnadie.vercel.app)
- GitHub: [https://github.com/LosNadie/FLOWER-3D](https://github.com/LosNadie/FLOWER-3D)

## 功能特性

- 3D 花束模型渲染（GLB）
- 左键拖动旋转花束
- 右键拖动移动花束
- 粉色流光背景与动态光照
- 顶部艺术字标题 `FLOWER`

## 技术栈

- HTML5
- CSS3
- JavaScript (ES Module)
- [Three.js](https://threejs.org/)
- WebGL

## 项目结构

```text
FLOWER-3D/
├─ assets/
│  ├─ bouquet.glb
│  └─ .gitkeep
├─ index.html
├─ style.css
├─ script.js
└─ README.md
```

## 本地运行

建议使用本地 HTTP 服务（不要直接双击 `index.html`，避免浏览器 CORS 限制）。

```bash
python -m http.server 9000
```

启动后访问：

- [http://127.0.0.1:9000](http://127.0.0.1:9000)

## 交互说明

- 左键按住拖动：旋转花束
- 右键按住拖动：移动花束

## 部署说明

项目已部署在 Vercel，后续更新可直接推送到 GitHub 后重新触发部署。


# 业务图片

把**商品图、头像、照片**放在这个目录。

Rudder 会优先使用这里的素材；没有提供时使用 `PlaceholderImage` 生成
本地 SVG 占位图（按标签生成可复现的几何图形），**不会外链**。

- 建议命名：`supplier-01.jpg`、`avatar-zhang.jpg`
- 常用路径：`/assets/supplier-01.jpg`
- 零外网依赖：演示时断网也能正常显示（见 `.rudder/design/assets.md`）

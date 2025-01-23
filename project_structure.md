# 知学小程序项目结构文档

## 一、目录结构

```
miniprogram/
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   │   ├── index.ts         # 首页逻辑
│   │   ├── index.wxml       # 首页模板
│   │   ├── index.scss       # 首页样式
│   │   └── index.json       # 首页配置
│   └── cards/               # 卡片功能页
│       ├── index.ts         # 卡片页面逻辑
│       ├── index.wxml       # 卡片页面模板
│       ├── index.scss       # 卡片页面样式
│       └── index.json       # 卡片页面配置
├── components/              # 组件目录
│   ├── navigation-bar/      # 导航栏组件
│   ├── card-display/        # 卡片展示组件
│   ├── custom-content/      # 自定义内容组件
│   ├── explore-topics/      # 探索主题组件
│   ├── review-cards/        # 复习卡片组件
│   └── manage-cards/        # 卡片管理组件
├── services/                # 服务目录
│   ├── ai.ts               # AI服务
│   ├── config.ts           # 配置服务
│   └── flashcards.ts       # 卡片服务
├── utils/                   # 工具目录
├── assets/                  # 资源目录
├── app.ts                   # 应用入口
├── app.json                 # 应用配置
└── app.scss                 # 全局样式
```

## 二、业务功能说明

### 1. 首页 (pages/index)
- 功能入口导航
- API密钥设置
- 页面跳转管理

### 2. 卡片功能页 (pages/cards)
- 四大功能模块的容器
- Tab导航管理
- 内容区域切换

### 3. 核心组件

#### 3.1 自定义内容 (custom-content)
- 文本输入
- 卡片数量设置
- 难度选择
- 卡片生成

#### 3.2 探索主题 (explore-topics)
- 关键词搜索
- 主题展示
- 卡片生成设置

#### 3.3 复习卡片 (review-cards)
- 主题筛选
- 卡片复习
- 学习进度追踪

#### 3.4 卡片管理 (manage-cards)
- 主题分组
- 批量操作
- 卡片展示

## 三、组件层级关系

### 1. 全局层级

```
页面容器
├── 导航栏 (z-index: 1000)      # 最高层级，确保始终在顶部
├── 页面内容 (z-index: 1)
└── 弹出层 (z-index: 2000)      # 预留给对话框等全局弹出层
```

### 2. 卡片页面层级

```
cards-container (z-index: 1)
├── navigation-bar (z-index: 1000)  # 导航栏固定在顶部
├── tab-bar (z-index: 100)          # 次高层级，确保在内容之上
└── content-area (z-index: 1)       # 基础层级
```

### 3. 功能组件层级

#### 3.1 卡片管理组件
```
manage-cards (z-index: 1)
├── batch-actions (z-index: 100)     # 固定在顶部的操作栏
└── topic-group (z-index: 1)
    ├── topic-header (z-index: 10)   # 确保在卡片列表之上
    └── card-list (z-index: 1)
```

#### 3.2 复习卡片组件
```
review-cards (z-index: 1)
├── topic-selector (z-index: 100)    # 固定在顶部的选择器
│   ├── selected-topics (z-index: 10)
│   └── dropdown-list (z-index: 200) # 确保下拉列表在其他内容之上
└── review-container (z-index: 1)
```

#### 3.3 卡片展示组件
```
card-display (z-index: 1)
├── close-btn (z-index: 10)          # 确保关闭按钮在内容之上
└── card-content (z-index: 1)
```

### 4. 层级规范

1. 基础层级
   - 普通内容区域：z-index: 1
   - 内容中的交互元素：z-index: 10

2. 中间层级
   - 固定定位的操作栏：z-index: 100
   - 下拉菜单/提示：z-index: 200

3. 顶层层级
   - 导航栏：z-index: 1000
   - 全局弹出层：z-index: 2000

4. 层级原则
   - 相邻元素层级差：10
   - 功能组间层级差：100
   - 全局组件层级差：1000

## 四、样式规范

### 1. 全局样式
```scss
page {
  height: 100%;
  background: #f5f6fa;
  box-sizing: border-box;
}

view {
  box-sizing: border-box;
}
```

### 2. 组件样式原则
- 使用 BEM 命名规范
- 组件样式隔离
- 统一的颜色变量
- 合理的层级管理

### 3. 动画处理
- 使用 transform 代替位置属性
- 添加必要的硬件加速
- 合理的动画时长和缓动函数

## 五、注意事项

### 1. 页面导航
- 使用 redirectTo 而不是 navigateTo
- 保持单层页面栈
- 正确处理返回逻辑

### 2. 状态管理
- 组件状态独立
- 及时清理无用状态
- 正确处理生命周期

### 3. 性能优化
- 避免不必要的渲染
- 合理使用 setData
- 优化动画性能

### 4. 代码维护
- 保持代码结构清晰
- 添加必要的注释
- 遵循统一的编码规范 
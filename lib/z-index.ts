/**
 * 统一的 Z-Index 管理系统
 * 用于解决UI组件层级冲突问题
 */

export const Z_INDEX = {
  // 基础层级 (0-99)
  BASE: 0,
  CONTENT: 10,
  CARD: 20,
  DROPDOWN: 30,
  
  // 界面组件层级 (100-199)
  SIDEBAR: 100,
  NAVBAR: 110,
  HEADER: 120,
  FOOTER: 130,
  
  // 交互组件层级 (200-299)
  TOOLTIP: 200,
  POPOVER: 210,
  MENU: 220,
  DRAWER: 230,
  
  // 窗口系统层级 (300-399)
  WINDOW_BASE: 300,
  WINDOW_ACTIVE: 310,
  WINDOW_MODAL: 320,
  WINDOW_MAXIMIZED: 330,
  
  // 弹窗和遮罩层级 (400-499)
  BACKDROP: 400,
  MODAL: 410,
  DIALOG: 420,
  ALERT: 430,
  
  // 临时和特殊层级 (500-599)
  LOADING: 500,
  TOAST: 510,
  NOTIFICATION: 520,
  DRAG_PREVIEW: 530,
  
  // 系统级别层级 (600+)
  SYSTEM_MODAL: 600,
  EMERGENCY: 700,
  DEBUG: 800,
  
  // 动态层级管理
  DYNAMIC_WINDOW_START: 1000,
  
  // 专用层级常量
  AI_CHAT: 250,
  SIDEBAR_OVERLAY: 140,
  MOBILE_MENU: 240,
} as const;

/**
 * 获取窗口动态z-index
 */
export function getWindowZIndex(windowId: string, isActive: boolean = false): number {
  const baseIndex = Z_INDEX.WINDOW_BASE;
  const activeBonus = isActive ? 10 : 0;
  
  // 简单的字符串哈希来确保一致性
  const hash = windowId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return baseIndex + (hash % 50) + activeBonus;
}

/**
 * 获取下一个可用的动态z-index
 */
let dynamicZIndexCounter = Z_INDEX.DYNAMIC_WINDOW_START;
export function getNextDynamicZIndex(): number {
  return ++dynamicZIndexCounter;
}

/**
 * 重置动态z-index计数器
 */
export function resetDynamicZIndex(): void {
  dynamicZIndexCounter = Z_INDEX.DYNAMIC_WINDOW_START;
}

/**
 * 检查z-index是否在指定范围内
 */
export function isZIndexInRange(zIndex: number, min: number, max: number): boolean {
  return zIndex >= min && zIndex <= max;
}

/**
 * 获取组件的推荐z-index
 */
export function getComponentZIndex(componentType: keyof typeof Z_INDEX): number {
  return Z_INDEX[componentType];
}

/**
 * z-index辅助类名生成器
 */
export function generateZIndexClass(zIndex: number): string {
  return `z-[${zIndex}]`;
}

/**
 * 样式对象生成器
 */
export function generateZIndexStyle(zIndex: number): React.CSSProperties {
  return { zIndex };
}

/**
 * 预定义的z-index类名
 */
export const Z_INDEX_CLASSES = {
  sidebar: generateZIndexClass(Z_INDEX.SIDEBAR),
  navbar: generateZIndexClass(Z_INDEX.NAVBAR),
  aiChat: generateZIndexClass(Z_INDEX.AI_CHAT),
  modal: generateZIndexClass(Z_INDEX.MODAL),
  toast: generateZIndexClass(Z_INDEX.TOAST),
  window: generateZIndexClass(Z_INDEX.WINDOW_BASE),
  windowActive: generateZIndexClass(Z_INDEX.WINDOW_ACTIVE),
  backdrop: generateZIndexClass(Z_INDEX.BACKDROP),
  mobileMenu: generateZIndexClass(Z_INDEX.MOBILE_MENU),
} as const;

/**
 * 调试工具：列出所有z-index值
 */
export function debugZIndex(): void {
  console.group('Z-Index Management System');
  Object.entries(Z_INDEX).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.groupEnd();
}
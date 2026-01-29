/**
 * 主题系统
 * 支持动态主题配置和 CSS 变量覆盖
 */

export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily?: string;
  cssVariables?: Record<string, string>;
}

/**
 * 边框圆角映射
 */
const RADIUS_MAP = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
} as const;

/**
 * 应用主题配置到 DOM 元素
 */
export const applyTheme = (config: ThemeConfig, targetElement?: HTMLElement): void => {
  const element = targetElement || document.documentElement;

  // 应用主色
  if (config.primaryColor) {
    element.style.setProperty('--dify-accent', config.primaryColor);
  }

  // 应用强调色
  if (config.accentColor) {
    element.style.setProperty('--dify-accent', config.accentColor);
  }

  // 应用圆角
  if (config.borderRadius && config.borderRadius in RADIUS_MAP) {
    const radius = RADIUS_MAP[config.borderRadius];
    element.style.setProperty('--dify-radius-md', radius);
    element.style.setProperty('--dify-radius-lg', `calc(${radius} + 4px)`);
  }

  // 应用字体
  if (config.fontFamily) {
    element.style.setProperty('--dify-font-family', config.fontFamily);
  }

  // 应用自定义 CSS 变量
  if (config.cssVariables) {
    Object.entries(config.cssVariables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }
};

/**
 * 移除主题配置
 */
export const removeTheme = (config: ThemeConfig, targetElement?: HTMLElement): void => {
  const element = targetElement || document.documentElement;

  if (config.primaryColor) {
    element.style.removeProperty('--dify-accent');
  }

  if (config.accentColor) {
    element.style.removeProperty('--dify-accent');
  }

  if (config.borderRadius) {
    element.style.removeProperty('--dify-radius-md');
    element.style.removeProperty('--dify-radius-lg');
  }

  if (config.fontFamily) {
    element.style.removeProperty('--dify-font-family');
  }

  if (config.cssVariables) {
    Object.keys(config.cssVariables).forEach((key) => {
      element.style.removeProperty(key);
    });
  }
};

/**
 * 预设主题
 */
export const PRESET_THEMES = {
  default: {
    primaryColor: '#111827',
    borderRadius: 'md' as const,
  },
  blue: {
    primaryColor: '#2563eb',
    borderRadius: 'md' as const,
  },
  purple: {
    primaryColor: '#7c3aed',
    borderRadius: 'md' as const,
  },
  green: {
    primaryColor: '#059669',
    borderRadius: 'md' as const,
  },
  rounded: {
    primaryColor: '#111827',
    borderRadius: 'xl' as const,
  },
} as const;

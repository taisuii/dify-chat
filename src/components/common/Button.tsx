/**
 * 通用按钮组件
 */
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost' | 'icon';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'medium',
  className = '',
  title,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const baseClass = 'dify-button';
  const variantClass = `dify-button--${variant}`;
  const sizeClass = `dify-button--${size}`;
  const disabledClass = disabled ? 'dify-button--disabled' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

/**
 * 弹出菜单组件
 */
import React, { useState, useRef, useEffect } from 'react';

export interface PopoverItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export interface PopoverProps {
  trigger: React.ReactNode;
  items: PopoverItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  items,
  placement = 'bottom-end',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: PopoverItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="dify-popover" ref={containerRef}>
      <div
        className="dify-popover__trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div className={`dify-popover__content dify-popover__content--${placement}`}>
          {items.map((item) => (
            <button
              key={item.key}
              className={`dify-popover__item ${item.danger ? 'dify-popover__item--danger' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
            >
              {item.icon && <span className="dify-popover__item-icon">{item.icon}</span>}
              <span className="dify-popover__item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

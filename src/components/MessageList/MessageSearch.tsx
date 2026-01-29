/**
 * 消息搜索组件
 */
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClose?: () => void;
  placeholder?: string;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  onSearch,
  onClose,
  placeholder = '搜索消息...',
}) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="dify-message-search">
      <div className="dify-message-search__input-wrapper">
        <Search size={16} className="dify-message-search__icon" />
        <input
          type="search"
          className="dify-message-search__input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          autoFocus
        />
        {query && (
          <button
            className="dify-message-search__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {onClose && (
        <button
          className="dify-message-search__close"
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

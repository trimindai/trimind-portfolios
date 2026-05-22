"use client";

import { ReactNode } from "react";

interface DynamicListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    updateItem: (updates: Partial<T>) => void
  ) => ReactNode;
  createEmpty: () => T;
  maxItems?: number;
  addLabel?: string;
}

export function DynamicList<T>({
  items,
  onChange,
  renderItem,
  createEmpty,
  maxItems = 10,
  addLabel = "Add Item",
}: DynamicListProps<T>) {
  const addItem = () => {
    if (items.length < maxItems) {
      onChange([...items, createEmpty()]);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<T>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="relative bg-[var(--land-surface-raised)]/50 border border-[var(--land-border)] rounded-lg p-4"
        >
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-[var(--land-muted)] hover:text-red-400 transition-colors text-sm"
          >
            Remove
          </button>
          {renderItem(item, index, (updates) => updateItem(index, updates))}
        </div>
      ))}
      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          className="w-full border border-dashed border-[var(--land-border)] hover:border-[var(--land-accent)] text-[var(--land-body)] hover:text-[var(--land-accent-hover)] rounded-lg py-3 text-sm transition-colors"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

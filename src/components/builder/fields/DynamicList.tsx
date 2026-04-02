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
          className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-4"
        >
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors text-sm"
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
          className="w-full border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 rounded-lg py-3 text-sm transition-colors"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { MotionConfig, Reorder, useDragControls } from "framer-motion";

interface DynamicListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    updateItem: (updates: Partial<T>) => void,
    stableKey: string
  ) => ReactNode;
  createEmpty: () => T;
  maxItems?: number;
  addLabel?: string;
  /** Label for the per-item remove button. Override for i18n. */
  removeLabel?: string;
  /** Label shown on the remove button while waiting for the confirming tap. */
  confirmRemoveLabel?: string;
}

/** True when every own value of the item is empty (blank string, empty array,
 *  or nullish) — deleting such an item needs no confirmation. */
function isItemEmpty(item: unknown): boolean {
  if (item == null) return true;
  if (typeof item !== "object") return !item;
  return Object.values(item as Record<string, unknown>).every((v) => {
    if (v == null) return true;
    if (typeof v === "string") return v.trim() === "";
    if (Array.isArray(v)) return v.length === 0 || v.every(isItemEmpty);
    if (typeof v === "object") return isItemEmpty(v);
    return false;
  });
}

/** One reorderable card. Split out so each item gets its own drag controls
 *  (drag starts only from the grip handle — the card is full of form inputs). */
function DynamicListItem<T>({
  item,
  stableKey,
  reorderable,
  dragLabel,
  onMove,
  children,
}: {
  item: T;
  stableKey: string;
  reorderable: boolean;
  dragLabel: string;
  onMove: (delta: number) => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      style={{ position: "relative", zIndex: dragging ? 10 : undefined }}
      className={`rounded-lg border p-4 transition-colors ${
        reorderable ? "ps-9" : ""
      } ${
        dragging
          ? "border-[var(--land-accent)]/60 bg-[var(--land-surface-raised)]"
          : "border-[var(--land-border)] bg-[var(--land-surface-raised)]/50"
      }`}
    >
      {reorderable && (
        <button
          type="button"
          aria-label={dragLabel}
          title={dragLabel}
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              onMove(-1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              onMove(1);
            }
          }}
          style={{ touchAction: "none" }}
          className={`absolute inset-y-0 start-0 flex w-8 cursor-grab items-center justify-center rounded-s-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--land-accent)] ${
            dragging
              ? "cursor-grabbing text-[var(--land-accent)]"
              : "text-[var(--land-muted)] hover:text-[var(--land-body)]"
          }`}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      )}
      {/* Enter animation lives on an inner div: builder-item-in animates
          `transform`, which would fight framer-motion's transform on the card. */}
      <div key={stableKey} className="builder-item-enter">
        {children}
      </div>
    </Reorder.Item>
  );
}

export function DynamicList<T>({
  items,
  onChange,
  renderItem,
  createEmpty,
  maxItems = 10,
  addLabel,
  removeLabel,
  confirmRemoveLabel,
}: DynamicListProps<T>) {
  const t = useTranslations("builder.fields");
  const addText = addLabel ?? t("addItem");
  const removeText = removeLabel ?? t("remove");
  const confirmText = confirmRemoveLabel ?? t("confirmRemove");
  const dragText = t("dragToReorder");
  const keysRef = useRef<string[]>([]);
  const counterRef = useRef(0);
  // Key of the item whose removal is awaiting confirmation (null = none).
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  // Grow keys for new items
  while (keysRef.current.length < items.length) {
    keysRef.current.push(`dl-${counterRef.current++}`);
  }
  // Trim if items were removed externally
  if (keysRef.current.length > items.length) {
    keysRef.current.length = items.length;
  }

  const addItem = () => {
    if (items.length < maxItems) {
      keysRef.current.push(`dl-${counterRef.current++}`);
      onChange([...items, createEmpty()]);
    }
  };

  const removeItem = (index: number) => {
    keysRef.current.splice(index, 1);
    setConfirmingKey(null);
    onChange(items.filter((_, i) => i !== index));
  };

  const requestRemove = (index: number) => {
    const key = keysRef.current[index];
    // Empty items delete instantly; filled items need a confirming second tap.
    if (isItemEmpty(items[index]) || confirmingKey === key) {
      removeItem(index);
      return;
    }
    setConfirmingKey(key);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmingKey(null), 3500);
  };

  const updateItem = (index: number, updates: Partial<T>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  // Drag drop order changed: keys must follow their items (matched by object
  // identity — reordering never recreates the item objects).
  const handleReorder = (next: T[]) => {
    keysRef.current = next.map((it) => keysRef.current[items.indexOf(it)]);
    onChange(next);
  };

  // Keyboard reorder from the grip handle (ArrowUp/ArrowDown).
  const moveItem = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const keys = [...keysRef.current];
    [next[index], next[to]] = [next[to], next[index]];
    [keys[index], keys[to]] = [keys[to], keys[index]];
    keysRef.current = keys;
    onChange(next);
  };

  const reorderable = items.length > 1;

  return (
    <MotionConfig reducedMotion="user">
      <Reorder.Group
        as="div"
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {items.map((item, index) => {
          const key = keysRef.current[index];
          const confirming = confirmingKey === key;
          return (
            <DynamicListItem
              key={key}
              stableKey={key}
              item={item}
              reorderable={reorderable}
              dragLabel={dragText}
              onMove={(delta) => moveItem(index, delta)}
            >
              <button
                type="button"
                onClick={() => requestRemove(index)}
                aria-label={confirming ? confirmText : removeText}
                className={`absolute top-2 end-2 inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 text-sm transition-colors ${
                  confirming
                    ? "bg-red-500/15 text-red-400 font-medium"
                    : "text-[var(--land-muted)] hover:text-red-400"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                {confirming ? confirmText : removeText}
              </button>
              {renderItem(item, index, (updates) => updateItem(index, updates), key)}
            </DynamicListItem>
          );
        })}
      </Reorder.Group>
      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 border border-dashed border-[var(--land-border)] hover:border-[var(--land-accent)] text-[var(--land-body)] hover:text-[var(--land-accent-hover)] rounded-lg py-3 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {addText}
        </button>
      )}
    </MotionConfig>
  );
}

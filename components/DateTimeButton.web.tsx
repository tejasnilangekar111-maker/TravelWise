import { useRef } from 'react';
import { View } from 'react-native';
import { mergePick } from '../utils/departure';
import type { PickMode } from '../utils/departure';
import type { DateTimeButtonProps } from './DateTimeButton';
import { PickerPill } from './PickerPill';

/**
 * Web has no native module, so the pill opens the browser's own date/time
 * picker through a hidden <input>.
 */

const pad = (n: number) => String(n).padStart(2, '0');

function toInputValue(mode: PickMode, d: Date): string {
  return mode === 'date'
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parses an input value back into a Date; null when the field was cleared. */
function fromInputValue(mode: PickMode, text: string): Date | null {
  const parts = text.split(/[-:]/).map(Number);
  if (!text || parts.some(Number.isNaN)) return null;
  if (mode === 'date') return new Date(parts[0], parts[1] - 1, parts[2]);
  const d = new Date();
  d.setHours(parts[0], parts[1], 0, 0);
  return d;
}

export function DateTimeButton({ mode, value, minimumDate, onChange, label }: DateTimeButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      // Older browsers: focusing the input still lets the user type a value.
      input.focus();
    }
  };

  return (
    <View>
      <PickerPill mode={mode} label={label} onPress={open} />
      <input
        ref={inputRef}
        type={mode}
        value={toInputValue(mode, value)}
        min={mode === 'date' ? toInputValue('date', minimumDate) : undefined}
        step={mode === 'time' ? 300 : undefined}
        onChange={(e) => {
          const picked = fromInputValue(mode, e.target.value);
          if (picked) onChange(mergePick(mode, value, picked));
        }}
        tabIndex={-1}
        aria-hidden
        // Kept in the layout (not display:none) so showPicker() can anchor to it.
        style={{ position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, opacity: 0, border: 0, padding: 0, pointerEvents: 'none' }}
      />
    </View>
  );
}

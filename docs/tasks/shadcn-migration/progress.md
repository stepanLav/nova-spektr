# Shadcn/UI Migration — Progress

## Status: ✅ Phase 5-6 Complete

**Branch:** `feature/shadcn-migration`
**Last updated:** 2026-03-06

---

## Completed Components (23 total)

### Phase 0-4 (previously done)
- accordion, alert, button, checkbox, dialog (Modal)
- input, progress, radio-group, scroll-area, select
- separator, skeleton, switch, tabs, textarea, tooltip, typography

### Phase 5-6 (this session)

| # | Component | File | Status |
|---|-----------|------|--------|
| 1 | Popover | `components/popover.tsx` | ✅ done |
| 2 | Dropdown | `components/dropdown.tsx` | ✅ done |
| 3 | Slider | `components/slider.tsx` | ✅ done |
| 4 | Table | `components/table.tsx` | ✅ done |
| 5 | Combobox | `components/combobox.tsx` | ✅ done |
| 6 | DateRangePicker | `components/date-range-picker.tsx` | ✅ done |

---

## TypeScript

`pnpm tsc --noEmit --skipLibCheck` → **0 errors** ✅

---

## Notes

- **Combobox:** Replaced @ariakit with native HTML + Radix Popover + keyboard nav (ArrowUp/Down/Enter/Escape)
- **Slider:** Inlined StepIndicators/StepLabels helpers (no external deps needed)
- **DateRangePicker:** Uses react-day-picker v9 with Tailwind classNames API; replaced i18n/Icon/Button deps with native equivalents
- **Dropdown:** Replaced Checkbox import from ui-kit with inline SVG checkmark
- All components export both compound Nova Spektr API AND shadcn-style primitives
- All use `cn()` from `../lib/utils`

---

## Exports updated in `index.ts`
All 6 new components + their shadcn-style primitives exported from `src/renderer/shared/ui-core/index.ts`.

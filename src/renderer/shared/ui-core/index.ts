/**
 * Nova Spektr UI Core — shadcn/ui component library
 *
 * Unified design system replacing shared/ui and shared/ui-kit.
 * Components maintain full API compatibility with originals.
 *
 * Migration status:
 *   ✅ Phase 0 — Infrastructure (CVA, tokens, cn())
 *   🔄 Phase 1 — Atomic components (Button, Separator, Switch, Checkbox, Skeleton)
 *   ⬜ Phase 2 — Forms (Input, Select, Combobox, Textarea, RadioGroup)
 *   ⬜ Phase 3 — Overlays (Dialog, Accordion, Tabs, Tooltip, Popover)
 *   ⬜ Phase 4 — Typography & Icons
 *   ⬜ Phase 5 — Complex (Table, DateRangePicker, Carousel)
 *   ⬜ Phase 6 — Unification & Cleanup
 *   ⬜ Phase 7 — Dark Theme
 */

// ─── Utilities ────────────────────────────────────────────────────────────────
export { cn } from './lib/utils';

// ─── Atomic Components ────────────────────────────────────────────────────────
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Separator } from './components/separator';
export { Switch, SwitchRoot } from './components/switch';
export { Checkbox, CheckboxRoot } from './components/checkbox';
export { Skeleton } from './components/skeleton';

/**
 * Nova Spektr UI Core — shadcn/ui component library
 *
 * Unified design system replacing shared/ui and shared/ui-kit.
 * Components maintain full API compatibility with originals.
 *
 * Migration status:
 *   ✅ Phase 0 — Infrastructure (CVA, tokens, cn())
 *   ✅ Phase 1 — Atomic (Button, Separator, Switch, Checkbox, Skeleton)
 *   ✅ Phase 2 — Forms (Input, Textarea, RadioGroup)
 *   ✅ Phase 3 — Overlays (Dialog/Modal, Tabs, Accordion, Tooltip)
 *   ✅ Phase 3b — Feedback (Alert, Progress, ScrollArea)
 *   ✅ Phase 4 — Typography (unified Text + 10 named aliases)
 *   ⬜ Phase 5 — Complex (Select, Table, DateRangePicker, Combobox)
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

// ─── Form Components ──────────────────────────────────────────────────────────
export { Input, type InputProps } from './components/input';
export { Textarea } from './components/textarea';
export { RadioGroup, RadioGroupRoot, RadioGroupItem } from './components/radio-group';

// ─── Overlay Components ───────────────────────────────────────────────────────
export {
  Modal,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';
export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Accordion, AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent } from './components/accordion';
export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from './components/tooltip';

// ─── Feedback Components ──────────────────────────────────────────────────────
export { Alert, alertVariants } from './components/alert';
export { Progress } from './components/progress';
export { ScrollArea, ScrollBar } from './components/scroll-area';

// ─── Typography ───────────────────────────────────────────────────────────────
export {
  Text,
  textVariants,
  LargeTitleText,
  TitleText,
  HeaderTitleText,
  MediumTitleText,
  SmallTitleText,
  HeadlineText,
  BodyText,
  FootnoteText,
  CaptionText,
  LabelText,
  HelpText,
} from './components/typography';

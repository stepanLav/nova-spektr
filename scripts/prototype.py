#!/usr/bin/env python3
"""
Prototype generator for nova-spektr.

Generates a Storybook story (.stories.tsx) using real nova-spektr UI components
from @/shared/ui, @/shared/ui-kit, and @/shared/ui-entities.

Usage:
    python3 scripts/prototype.py "feature description" output-name
    python3 scripts/prototype.py "delegation confirm modal with address and amount" delegate-confirm

Output:
    src/renderer/stories/prototypes/<output-name>.stories.tsx

Requirements:
    OPENROUTER_API_KEY env var (see SECRETS.md)
"""

import sys
import os
import json
import urllib.request
import urllib.error
import re
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / 'src' / 'renderer' / 'stories' / 'prototypes'
MODEL = 'anthropic/claude-opus-4-5'
API_URL = 'https://openrouter.ai/api/v1/chat/completions'

API_KEY = os.environ.get('OPENROUTER_API_KEY', '')

# ─── Component API reference ──────────────────────────────────────────────────

COMPONENT_REFERENCE = """
## nova-spektr Component API

Path alias: `@/*` → `src/renderer/*`

---

### @/shared/ui — Core UI components

#### Button
```tsx
import { Button } from '@/shared/ui';
// variant: 'fill' (default) | 'text' | 'chip'
// pallet: 'primary' (default) | 'secondary' | 'error'
// size: 'md' (default) | 'sm'
<Button variant="fill" pallet="primary" size="md" disabled={false} onClick={fn}>
  Label
</Button>
// With prefix/suffix icon:
<Button prefixElement={<Icon name="add" />}>Add account</Button>
```

#### IconButton
```tsx
import { IconButton } from '@/shared/ui';
<IconButton name="gear" onClick={fn} />
```

#### Typography
```tsx
import { BodyText, FootnoteText, HeadlineText, TitleText, LabelText,
         CaptionText, HelpText, SmallTitleText, LargeTitleText } from '@/shared/ui';
// All accept className prop
<TitleText className="text-text-primary">Title</TitleText>
<HeadlineText>Headline</HeadlineText>
<BodyText>Regular body text</BodyText>
<FootnoteText className="text-text-tertiary">Small note</FootnoteText>
<CaptionText>Caption</CaptionText>
<LabelText>Label</LabelText>
```

#### Icon
```tsx
import { Icon } from '@/shared/ui';
// Common icon names: 'add', 'close', 'checkmark', 'gear', 'warning', 'info',
//                   'arrowLeft', 'arrowRight', 'chevronDown', 'copy', 'wallet'
<Icon name="add" size={16} className="text-icon-default" />
```

#### Shimmering (skeleton placeholder)
```tsx
import { Shimmering } from '@/shared/ui';
<Shimmering width={120} height={16} />
```

#### Plate
```tsx
import { Plate } from '@/shared/ui';
// Card-like container
<Plate className="p-4">content</Plate>
```

#### Separator
```tsx
import { Separator } from '@/shared/ui';
<Separator />
```

#### OperationStatus
```tsx
import { OperationStatus } from '@/shared/ui';
// pallet: 'success' | 'error' | 'waiting' | 'default'
<OperationStatus pallet="success">Signed</OperationStatus>
```

#### DetailRow (label + value pair)
```tsx
import { DetailRow } from '@/shared/ui';
<DetailRow label="Network fee">
  <BodyText>0.0012 DOT</BodyText>
</DetailRow>
```

#### Switch
```tsx
import { Switch } from '@/shared/ui';
<Switch checked={checked} onChange={setChecked} />
```

#### Alert
```tsx
import { Alert } from '@/shared/ui';
// variant: 'info' | 'warn' | 'error'
<Alert title="Note" variant="warn">
  Tokens will be locked for 28 days
</Alert>
```

---

### @/shared/ui-kit — Design System Kit

#### Modal
```tsx
import { Modal } from '@/shared/ui-kit';
// size: 'sm' | 'md' | 'mdlg' | 'lg' | 'xl' | 'xxl' | 'full' | 'fit'
// height: 'fit' (default) | 'full' | 'lg'

// Pattern A — controlled (isOpen + onToggle):
const [isOpen, onToggle] = useState(false);
<>
  <Button onClick={() => onToggle(true)}>Open</Button>
  <Modal isOpen={isOpen} size="md" onToggle={onToggle}>
    <Modal.Title close>Modal title</Modal.Title>
    <Modal.Content>
      {/* content here */}
    </Modal.Content>
    <Modal.Footer>
      <Button variant="text" onClick={() => onToggle(false)}>Cancel</Button>
      <Button onClick={() => onToggle(false)}>Confirm</Button>
    </Modal.Footer>
  </Modal>
</>

// Pattern B — with built-in trigger:
<Modal size="md">
  <Modal.Trigger>
    <Button>Open modal</Button>
  </Modal.Trigger>
  <Modal.Title close>Modal title</Modal.Title>
  <Modal.Content>content</Modal.Content>
</Modal>
```

#### Input
```tsx
import { Input } from '@/shared/ui-kit';
// height: 'sm' (default) | 'md'
// width: 'md' (default) | 'full'
// onChange receives string value (not event!)
<Input
  placeholder="Enter address..."
  value={value}
  height="sm"
  width="full"
  invalid={hasError}
  onChange={(val: string) => setValue(val)}
/>
```

#### Select
```tsx
import { Select } from '@/shared/ui-kit';
// onChange receives string value
<Select placeholder="Choose network" value={value} onChange={setValue}>
  <Select.Item value="polkadot">Polkadot</Select.Item>
  <Select.Item value="kusama">Kusama</Select.Item>
  <Select.Item value="westend">Westend</Select.Item>
</Select>
```

#### Surface (card container)
```tsx
import { Surface } from '@/shared/ui-kit';
// elevation: 0 | 1 | 2
// as: 'div' (default) | 'button'
<Surface elevation={1} className="p-4">
  content
</Surface>
```

#### Box (flexbox helper)
```tsx
import { Box } from '@/shared/ui-kit';
// direction: 'column' (default) | 'row' | 'row-reverse' | 'column-reverse'
<Box direction="row" gap={4} padding={4}>
  <Button>A</Button>
  <Button>B</Button>
</Box>
```

#### Tabs
```tsx
import { Tabs } from '@/shared/ui-kit';
<Tabs>
  <Tabs.List>
    <Tabs.Item value="overview">Overview</Tabs.Item>
    <Tabs.Item value="history">History</Tabs.Item>
  </Tabs.List>
  <Tabs.Content value="overview">Overview content</Tabs.Content>
  <Tabs.Content value="history">History content</Tabs.Content>
</Tabs>
```

#### Accordion
```tsx
import { Accordion } from '@/shared/ui-kit';
<Accordion isDefaultOpen>
  <Accordion.Button>Section title</Accordion.Button>
  <Accordion.Content>Section content</Accordion.Content>
</Accordion>
```

#### Checkbox
```tsx
import { Checkbox } from '@/shared/ui-kit';
<Checkbox checked={checked} onChange={setChecked}>Label text</Checkbox>
```

#### RadioGroup
```tsx
import { RadioGroup } from '@/shared/ui-kit';
<RadioGroup value={value} onChange={setValue}>
  <RadioGroup.Option value="a">Option A</RadioGroup.Option>
  <RadioGroup.Option value="b">Option B</RadioGroup.Option>
</RadioGroup>
```

#### Tooltip
```tsx
import { Tooltip } from '@/shared/ui-kit';
<Tooltip content="Tooltip text">
  <Button>Hover me</Button>
</Tooltip>
```

#### Popover
```tsx
import { Popover } from '@/shared/ui-kit';
<Popover>
  <Popover.Trigger>
    <Button variant="text">More options</Button>
  </Popover.Trigger>
  <Popover.Content>content</Popover.Content>
</Popover>
```

#### ScrollArea
```tsx
import { ScrollArea } from '@/shared/ui-kit';
<ScrollArea className="h-64">
  {/* scrollable content */}
</ScrollArea>
```

#### Skeleton
```tsx
import { Skeleton } from '@/shared/ui-kit';
<Skeleton className="h-4 w-32 rounded" />
```

#### Label
```tsx
import { Label } from '@/shared/ui-kit';
// variant: 'default' | 'top'
<Label label="Field name" variant="top">
  <Input placeholder="value" />
</Label>
```

#### SearchInput
```tsx
import { SearchInput } from '@/shared/ui-kit';
<SearchInput value={query} onChange={setQuery} placeholder="Search..." />
```

#### Copy
```tsx
import { Copy } from '@/shared/ui-kit';
<Copy text="value to copy" />
```

#### Combobox
```tsx
import { Combobox } from '@/shared/ui-kit';
<Combobox
  value={value}
  options={[{ id: '1', element: <span>Option 1</span>, value: 'opt1' }]}
  onChange={setValue}
  placeholder="Search..."
/>
```

---

### @/shared/ui-entities — Domain Entities

#### Identicon (Polkadot address avatar)
```tsx
import { Identicon } from '@/shared/ui-entities';
// address: SS58 string; theme: 'polkadot' | 'substrate' | 'ethereum'; size in px
<Identicon address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" size={32} theme="polkadot" />
```

#### Hash (transaction/block hash)
```tsx
import { Hash } from '@/shared/ui-entities';
// variant: 'full' | 'truncate' | 'short'
<Hash value="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" variant="truncate" />
```

#### AssetBalance
```tsx
import { AssetBalance } from '@/shared/ui-entities';
// Shows formatted token amount with symbol
<AssetBalance value="1250000000000" asset={{ symbol: 'DOT', precision: 10 }} />
```

#### WalletIcon
```tsx
import { WalletIcon } from '@/shared/ui-entities';
// type: 'polkadot_vault' | 'watch_only' | 'multisig' | 'nova_wallet' | 'wallet_connect'
<WalletIcon type="polkadot_vault" size={32} />
```
"""

# ─── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = f"""You are a UI prototype generator for nova-spektr — a Polkadot Desktop wallet built with Electron + React + TypeScript + Tailwind CSS.

Your job: generate a Storybook story file (.stories.tsx) that prototypes a UI feature using ONLY real components from nova-spektr's design system.

{COMPONENT_REFERENCE}

## Storybook setup

The Storybook preview.tsx already wraps all stories globally with:
- ThemeProvider (light/dark toggle in toolbar)
- I18Provider (translations)
- NotificationProvider

So in your story: DO NOT manually wrap with ThemeProvider, I18Provider, or NotificationProvider.

## Rules

1. Import components ONLY from '@/shared/ui', '@/shared/ui-kit', '@/shared/ui-entities'
2. Do NOT import ThemeProvider, I18Provider, or NotificationProvider — they are global decorators
3. No API calls, no fetch, no async — use static mock data defined inline
4. No business logic — only UI state with useState/useReducer
5. If a needed component doesn't exist in the reference — build it inline using composition of existing components + Tailwind classes. Never import other libraries.
6. Use realistic Polkadot mock data: SS58 addresses (5Grwv...), DOT/KSM amounts, parachain names, tx hashes
7. Use Tailwind classes for spacing/layout when Box is too verbose (e.g. className="flex gap-4 items-center")
8. Output ONLY valid TypeScript/TSX — no markdown fences, no explanation, just the file content
9. The story title should be: `Prototypes/<FeatureName>`
10. Use `'type'` import syntax for types: `import type {{ Meta, StoryObj }} from '@storybook/react-vite'`

## Output format

```tsx
import type {{ Meta, StoryObj }} from '@storybook/react-vite';
import {{ useState }} from 'react';
import {{ Button, BodyText, FootnoteText, DetailRow }} from '@/shared/ui';
import {{ Modal, Input, Select, Surface }} from '@/shared/ui-kit';
import {{ Identicon, Hash }} from '@/shared/ui-entities';

// Inline components (only if needed)
const SomeCustomPiece = (...) => ...;

const FeaturePrototype = () => {{
  const [isOpen, onToggle] = useState(true);
  // ...state

  return (
    // JSX using real components
  );
}};

const meta: Meta<typeof FeaturePrototype> = {{
  component: FeaturePrototype,
  title: 'Prototypes/<FeatureName>',
  parameters: {{
    layout: 'centered',
  }},
}};

export default meta;

type Story = StoryObj<typeof FeaturePrototype>;

export const Default: Story = {{}};
```
"""

# ─── Main ─────────────────────────────────────────────────────────────────────

def generate_prototype(description: str, output_name: str) -> None:
    if not API_KEY:
        print('❌ OPENROUTER_API_KEY not set', file=sys.stderr)
        sys.exit(1)

    print(f'🔨 Generating prototype: {output_name}')
    print(f'📝 Feature: {description}')
    print(f'🤖 Model: {MODEL}')
    print()

    payload = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {
                'role': 'user',
                'content': f'Generate a Storybook story prototype for this feature:\n\n{description}',
            },
        ],
        'max_tokens': 4096,
        'temperature': 0.3,
    }).encode('utf-8')

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/novasamatech/nova-spektr',
            'X-Title': 'nova-spektr prototype generator',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'❌ API error {e.code}: {body}', file=sys.stderr)
        sys.exit(1)

    content = data['choices'][0]['message']['content'].strip()

    # Strip markdown code fences if model wraps output
    content = re.sub(r'^```(?:tsx|typescript|jsx)?\n', '', content)
    content = re.sub(r'\n```$', '', content)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f'{output_name}.stories.tsx'
    out_path.write_text(content, encoding='utf-8')

    print(f'✅ Saved: {out_path.relative_to(REPO_ROOT)}')
    print()
    print('Next steps:')
    print('  pnpm storybook')
    print('  → Open: http://localhost:6006 → Prototypes')


def main():
    if len(sys.argv) < 3:
        print('Usage: python3 scripts/prototype.py "feature description" output-name')
        print()
        print('Example:')
        print('  python3 scripts/prototype.py "delegation confirm modal with address and amount" delegate-confirm')
        sys.exit(1)

    description = sys.argv[1]
    output_name = sys.argv[2]
    output_name = re.sub(r'[^a-zA-Z0-9_-]', '-', output_name).strip('-')

    generate_prototype(description, output_name)


if __name__ == '__main__':
    main()

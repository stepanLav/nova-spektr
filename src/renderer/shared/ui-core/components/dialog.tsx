/**
 * Dialog — shadcn/ui component
 * Replaces: shared/ui-kit/Modal/Modal.tsx, shared/ui/Modals/BaseModal/BaseModal.tsx
 *
 * API compatibility:
 *   - Same compound component API: Dialog.Root, Dialog.Trigger, Dialog.Content, etc.
 *   - Nova Spektr Modal API preserved via ModalRoot wrapper
 *   - Shadcn-style Dialog.* exports for new code
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, type ReactNode, Children, forwardRef, isValidElement } from 'react';

import { IconButton } from '@/shared/ui/Buttons/IconButton/IconButton';
import { cn } from '../lib/utils';

// ─── Shadcn-style Dialog components ──────────────────────────────────────────

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-dim-background',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden',
        'rounded-lg bg-card shadow-modal',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-between border-b border-divider px-5 py-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-3 border-t border-divider px-5 py-4', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-small-title text-text-primary', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-footnote text-text-secondary', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ─── Nova Spektr Modal (compatible API) ──────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'mdlg' | 'lg' | 'xl' | 'xxl' | 'full' | 'fit';
type ModalHeight = 'full' | 'lg' | 'fit';

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'w-modal-sm',
  md: 'w-modal',
  mdlg: 'w-148',
  lg: 'w-modal-lg',
  xl: 'w-modal-xl',
  xxl: 'w-modal-xxl',
  full: 'w-full',
  fit: 'w-fit',
};

const HEIGHT_CLASS: Record<ModalHeight, string> = {
  fit: 'h-fit',
  full: 'h-full',
  lg: 'h-modal',
};

type ModalProps = {
  isOpen?: boolean;
  size?: ModalSize;
  height?: ModalHeight;
  testId?: string;
  preventOutsideClick?: boolean;
  onToggle?: (open: boolean) => void;
};

const ModalTrigger = DialogPrimitive.Trigger;
ModalTrigger.displayName = 'Modal.Trigger';

const ModalTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-small-title text-text-primary', className)}
    {...props}
  />
));
ModalTitle.displayName = 'Modal.Title';

const ModalClose = ({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close asChild>
    <IconButton name="close" size={20} className={cn('ml-auto', className)} {...props} />
  </DialogPrimitive.Close>
);
ModalClose.displayName = 'Modal.Close';

/**
 * Nova Spektr Modal — backward-compatible API
 *
 * @example
 * // Controlled modal
 * <Modal isOpen={isOpen} size="md" onToggle={setOpen}>
 *   <Modal.Title>Send Transaction</Modal.Title>
 *   <div className="p-5">Content</div>
 * </Modal>
 *
 * @example
 * // With trigger
 * <Modal size="sm" onToggle={setOpen}>
 *   <Modal.Trigger>
 *     <Button>Open</Button>
 *   </Modal.Trigger>
 *   <div className="p-5">Content</div>
 * </Modal>
 */
const ModalRoot = ({
  isOpen,
  size = 'md',
  height = 'fit',
  children,
  onToggle,
  testId = 'Modal',
  preventOutsideClick = false,
}: PropsWithChildren<ModalProps>) => {
  // Separate trigger (if any) from modal body
  const childArray = Children.toArray(children);
  const triggerNode = childArray.find(
    (child) => isValidElement(child) && child.type === ModalTrigger,
  );
  const modalNodes = triggerNode ? childArray.filter((c) => c !== triggerNode) : childArray;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onToggle}>
      {triggerNode}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-hidden p-4',
            'bg-dim-background',
            'data-[state=open]:animate-in data-[state=open]:fade-in',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out',
            'duration-300',
          )}
        >
          <DialogPrimitive.Content
            aria-describedby={undefined}
            data-testid={testId}
            className={cn(
              'flex max-w-full min-w-32 flex-col overflow-hidden',
              'text-left align-middle text-body',
              'rounded-lg bg-white shadow-modal',
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
              'duration-200',
              SIZE_CLASS[size],
              HEIGHT_CLASS[height],
            )}
            onInteractOutside={preventOutsideClick ? (e) => e.preventDefault() : undefined}
          >
            {modalNodes}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

/**
 * Modal — compound component compatible with Nova Spektr existing API
 */
export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Title: ModalTitle,
  Close: ModalClose,
});

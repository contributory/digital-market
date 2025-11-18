# UI Components

A comprehensive collection of reusable UI components built with Radix UI primitives and Tailwind CSS.

## Available Components

### Form Components

- **Button** - Versatile button component with multiple variants (primary, secondary, outline, ghost, link, danger) and sizes (sm, md, lg, icon)
- **Input** - Text input field with focus states and full accessibility
- **Select** - Dropdown select with keyboard navigation and search

### Display Components

- **Badge** - Small status indicators with variants (default, secondary, outline, success, warning, danger)
- **Card** - Container component with Header, Title, Description, Content, and Footer sections
- **Alert** - Notification alerts with variants (default, success, warning, danger, info)
- **Skeleton** - Loading placeholders with pulse animation
- **RatingStars** - Star rating display (read-only or interactive)

### Navigation Components

- **Breadcrumbs** - Hierarchical page navigation
- **Tabs** - Tabbed content panels with keyboard navigation
- **Dropdown Menu** - Context menus and dropdowns with full keyboard support

### Feedback Components

- **Toast** - Temporary notification messages with actions
- **Modal** - Dialog overlays for focused tasks

## Usage Examples

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>;
```

### Toast Notifications

```tsx
import { toast } from '@/components/ui/use-toast';

toast({
  title: 'Success!',
  description: 'Your action was completed.',
  variant: 'success',
});
```

### Rating Stars

```tsx
import { RatingStars } from '@/components/ui/rating-stars';

// Read-only
<RatingStars rating={4.5} showValue />

// Interactive
<RatingStars
  rating={rating}
  readonly={false}
  onChange={setRating}
  showValue
/>
```

### Modal

```tsx
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';

<Modal>
  <ModalTrigger asChild>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <ModalDescription>Modal description</ModalDescription>
    </ModalHeader>
    <div>Modal content</div>
    <ModalFooter>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>;
```

## Component Preview

Visit `/components-preview` to see all components in action with live examples.

## Theming

All components use CSS custom properties for theming. Colors automatically adapt to light/dark mode.

Key theme variables:

- `--background` / `--foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--border`
- `--accent` / `--accent-foreground`

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Full keyboard navigation support
- ARIA labels and roles
- Focus visible states
- Screen reader compatibility
- Semantic HTML structure

## TypeScript

All components are fully typed with TypeScript for excellent developer experience and type safety.

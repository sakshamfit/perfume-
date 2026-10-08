# Component catalogue

Two libraries live in this repo and they behave very differently:

1. **`components/ui/*` — 61 shadcn-style primitives.** Complete, typed, importable, and **not used by a single line of the page**. They came with the starter. `app/globals.css` also never imports the theme layer they depend on, so they render unstyled until you wire it up (see below).
2. **The site's own patterns**, hand-written inside `app/page.tsx` + `app/globals.css` — the curtain, hero parallax, staggered cards, pinned stage, modal multiplexer, toast. These are the pieces worth stealing between projects, and they are *not* extracted into files yet.

Regenerate this file with `node scripts/build-component-catalog.mjs`.

## Before you import anything from `components/ui`

Those files style themselves with semantic tokens (`bg-background`, `text-muted-foreground`, `border-input`, `ring`) that this project does not define. Verified state of the repo:

```bash
grep -c -- "--background" app/globals.css   # 0 -> no token layer
grep -c "@import" app/globals.css          # 1 -> only "tailwindcss"
```

So one of these is required, once per project:

- run `npx shadcn@latest init` (adds the `:root` / `.dark` token block and `tw-animate-css`), or
- hand-paste a minimal token block and keep `vendor/shadcn-tailwind-4.13.0.css` (MIT, © 2023 shadcn) imported for its `@theme` keyframes + `data-*` custom variants — that file defines motion and variants, **not** colours.

Then the components drop in as-is. Everything below assumes that step is done.

## Index of primitives

| File | Exports | Direct deps | cva variants | data-slots | Lines |
| --- | --- | --- | :---: | --- | ---: |
| `accordion.tsx` | `Accordion` `AccordionItem` `AccordionTrigger` `AccordionContent` | `lucide-react` `radix-ui` |  | `accordion` `accordion-item` `accordion-trigger` `accordion-content` | 67 |
| `alert-dialog.tsx` | `AlertDialog` `AlertDialogAction` `AlertDialogCancel` `AlertDialogContent` `AlertDialogDescription` `AlertDialogFooter` `AlertDialogHeader` `AlertDialogMedia` `AlertDialogOverlay` `AlertDialogPortal` `AlertDialogTitle` `AlertDialogTrigger` | `radix-ui` |  | `alert-dialog` `alert-dialog-trigger` `alert-dialog-portal` `alert-dialog-overlay` +8 | 197 |
| `alert.tsx` | `Alert` `AlertTitle` `AlertDescription` | `class-variance-authority` | ● | `alert` `alert-title` `alert-description` | 67 |
| `aspect-ratio.tsx` | `AspectRatio` | `radix-ui` |  | `aspect-ratio` | 12 |
| `attachment.tsx` | `Attachment` `AttachmentGroup` `AttachmentMedia` `AttachmentContent` `AttachmentTitle` `AttachmentDescription` `AttachmentActions` `AttachmentAction` `AttachmentTrigger` | `class-variance-authority` `radix-ui` | ● | `attachment` `attachment-media` `attachment-content` `attachment-title` +5 | 205 |
| `avatar.tsx` | `Avatar` `AvatarImage` `AvatarFallback` `AvatarBadge` `AvatarGroup` `AvatarGroupCount` | `radix-ui` |  | `avatar` `avatar-image` `avatar-fallback` `avatar-badge` +2 | 110 |
| `badge.tsx` | `Badge` `badgeVariants` | `class-variance-authority` `radix-ui` | ● | `badge` | 49 |
| `breadcrumb.tsx` | `Breadcrumb` `BreadcrumbList` `BreadcrumbItem` `BreadcrumbLink` `BreadcrumbPage` `BreadcrumbSeparator` `BreadcrumbEllipsis` | `lucide-react` `radix-ui` |  | `breadcrumb` `breadcrumb-list` `breadcrumb-item` `breadcrumb-link` +3 | 110 |
| `bubble.tsx` | `BubbleGroup` `Bubble` `BubbleContent` `BubbleReactions` | `class-variance-authority` `radix-ui` | ● | `bubble-group` `bubble` `bubble-content` `bubble-reactions` | 126 |
| `button-group.tsx` | `ButtonGroup` `ButtonGroupSeparator` `ButtonGroupText` `buttonGroupVariants` | `class-variance-authority` `radix-ui` | ● | `button-group` `button-group-separator` | 84 |
| `button.tsx` | `Button` `buttonVariants` | `class-variance-authority` `radix-ui` | ● | `button` | 65 |
| `calendar.tsx` | `Calendar` `CalendarDayButton` | `lucide-react` `react-day-picker` |  | `calendar` | 221 |
| `card.tsx` | `Card` `CardHeader` `CardFooter` `CardTitle` `CardAction` `CardDescription` `CardContent` | — |  | `card` `card-header` `card-title` `card-description` +3 | 93 |
| `carousel.tsx` | `type CarouselApi` `Carousel` `CarouselContent` `CarouselItem` `CarouselPrevious` `CarouselNext` | `embla-carousel-react` `lucide-react` |  | `carousel` `carousel-content` `carousel-item` `carousel-previous` +1 | 242 |
| `chart.tsx` | `ChartContainer` `ChartTooltip` `ChartTooltipContent` `ChartLegend` `ChartLegendContent` `ChartStyle` | `recharts` |  | `chart` | 378 |
| `checkbox.tsx` | `Checkbox` | `lucide-react` `radix-ui` |  | `checkbox` `checkbox-indicator` | 33 |
| `collapsible.tsx` | `Collapsible` `CollapsibleTrigger` `CollapsibleContent` | `radix-ui` |  | `collapsible` `collapsible-trigger` `collapsible-content` | 34 |
| `combobox.tsx` | `Combobox` `ComboboxInput` `ComboboxContent` `ComboboxList` `ComboboxItem` `ComboboxGroup` `ComboboxLabel` `ComboboxCollection` `ComboboxEmpty` `ComboboxSeparator` `ComboboxChips` `ComboboxChip` `ComboboxChipsInput` `ComboboxTrigger` `ComboboxValue` `useComboboxAnchor` | `@base-ui/react` `lucide-react` |  | `combobox-value` `combobox-trigger` `combobox-trigger-icon` `combobox-clear` +14 | 311 |
| `command.tsx` | `Command` `CommandDialog` `CommandInput` `CommandList` `CommandEmpty` `CommandGroup` `CommandItem` `CommandShortcut` `CommandSeparator` | `cmdk` `lucide-react` |  | `command` `command-input-wrapper` `command-input` `command-list` +5 | 185 |
| `context-menu.tsx` | `ContextMenu` `ContextMenuTrigger` `ContextMenuContent` `ContextMenuItem` `ContextMenuCheckboxItem` `ContextMenuRadioItem` `ContextMenuLabel` `ContextMenuSeparator` `ContextMenuShortcut` `ContextMenuGroup` `ContextMenuPortal` `ContextMenuSub` `ContextMenuSubContent` `ContextMenuSubTrigger` `ContextMenuRadioGroup` | `lucide-react` `radix-ui` |  | `context-menu` `context-menu-trigger` `context-menu-group` `context-menu-portal` +11 | 253 |
| `dialog.tsx` | `Dialog` `DialogClose` `DialogContent` `DialogDescription` `DialogFooter` `DialogHeader` `DialogOverlay` `DialogPortal` `DialogTitle` `DialogTrigger` | `lucide-react` `radix-ui` |  | `dialog` `dialog-trigger` `dialog-portal` `dialog-close` +6 | 159 |
| `direction.tsx` | `DirectionProvider` `useDirection` | `radix-ui` |  | — | 23 |
| `drawer.tsx` | `Drawer` `DrawerPortal` `DrawerOverlay` `DrawerTrigger` `DrawerClose` `DrawerContent` `DrawerHeader` `DrawerFooter` `DrawerTitle` `DrawerDescription` | `vaul` |  | `drawer` `drawer-trigger` `drawer-portal` `drawer-close` +6 | 136 |
| `dropdown-menu.tsx` | `DropdownMenu` `DropdownMenuPortal` `DropdownMenuTrigger` `DropdownMenuContent` `DropdownMenuGroup` `DropdownMenuLabel` `DropdownMenuItem` `DropdownMenuCheckboxItem` `DropdownMenuRadioGroup` `DropdownMenuRadioItem` `DropdownMenuSeparator` `DropdownMenuShortcut` `DropdownMenuSub` `DropdownMenuSubTrigger` `DropdownMenuSubContent` | `lucide-react` `radix-ui` |  | `dropdown-menu` `dropdown-menu-portal` `dropdown-menu-trigger` `dropdown-menu-content` +11 | 258 |
| `empty.tsx` | `Empty` `EmptyHeader` `EmptyTitle` `EmptyDescription` `EmptyContent` `EmptyMedia` | `class-variance-authority` | ● | `empty` `empty-header` `empty-icon` `empty-title` +2 | 105 |
| `field.tsx` | `Field` `FieldLabel` `FieldDescription` `FieldError` `FieldGroup` `FieldLegend` `FieldSeparator` `FieldSet` `FieldContent` `FieldTitle` | `class-variance-authority` | ● | `field-set` `field-legend` `field-group` `field` +6 | 249 |
| `form.tsx` | `useFormField` `Form` `FormItem` `FormLabel` `FormControl` `FormDescription` `FormMessage` `FormField` | `radix-ui` `react-hook-form` |  | `form-item` `form-label` `form-control` `form-description` +1 | 168 |
| `hover-card.tsx` | `HoverCard` `HoverCardTrigger` `HoverCardContent` | `radix-ui` |  | `hover-card` `hover-card-trigger` `hover-card-portal` `hover-card-content` | 45 |
| `input-group.tsx` | `InputGroup` `InputGroupAddon` `InputGroupButton` `InputGroupText` `InputGroupInput` `InputGroupTextarea` | `class-variance-authority` | ● | `input-group` `input-group-addon` `input-group-control` | 171 |
| `input-otp.tsx` | `InputOTP` `InputOTPGroup` `InputOTPSlot` `InputOTPSeparator` | `input-otp` `lucide-react` |  | `input-otp` `input-otp-group` `input-otp-slot` `input-otp-separator` | 78 |
| `input.tsx` | `Input` | — |  | `input` | 22 |
| `item.tsx` | `Item` `ItemMedia` `ItemContent` `ItemActions` `ItemGroup` `ItemSeparator` `ItemTitle` `ItemDescription` `ItemHeader` `ItemFooter` | `class-variance-authority` `radix-ui` | ● | `item-group` `item-separator` `item` `item-media` +6 | 194 |
| `kbd.tsx` | `Kbd` `KbdGroup` | — |  | `kbd` `kbd-group` | 29 |
| `label.tsx` | `Label` | `radix-ui` |  | `label` | 25 |
| `marker.tsx` | `Marker` `MarkerIcon` `MarkerContent` `markerVariants` | `class-variance-authority` `radix-ui` | ● | `marker` `marker-icon` `marker-content` | 70 |
| `menubar.tsx` | `Menubar` `MenubarPortal` `MenubarMenu` `MenubarTrigger` `MenubarContent` `MenubarGroup` `MenubarSeparator` `MenubarLabel` `MenubarItem` `MenubarShortcut` `MenubarCheckboxItem` `MenubarRadioGroup` `MenubarRadioItem` `MenubarSub` `MenubarSubTrigger` `MenubarSubContent` | `lucide-react` `radix-ui` |  | `menubar` `menubar-menu` `menubar-group` `menubar-portal` +12 | 277 |
| `message-scroller.tsx` | `MessageScrollerProvider` `MessageScroller` `MessageScrollerViewport` `MessageScrollerContent` `MessageScrollerItem` `MessageScrollerButton` `useMessageScroller` `useMessageScrollerScrollable` `useMessageScrollerVisibility` | `@shadcn/react/message-scroller` `lucide-react` |  | `message-scroller` `message-scroller-viewport` `message-scroller-content` `message-scroller-item` +1 | 131 |
| `message.tsx` | `MessageGroup` `Message` `MessageAvatar` `MessageContent` `MessageFooter` `MessageHeader` | — |  | `message-group` `message` `message-avatar` `message-content` +2 | 93 |
| `native-select.tsx` | `NativeSelect` `NativeSelectOptGroup` `NativeSelectOption` | `lucide-react` |  | `native-select-wrapper` `native-select` `native-select-icon` `native-select-option` +1 | 63 |
| `navigation-menu.tsx` | `NavigationMenu` `NavigationMenuList` `NavigationMenuItem` `NavigationMenuContent` `NavigationMenuTrigger` `NavigationMenuLink` `NavigationMenuIndicator` `NavigationMenuViewport` `navigationMenuTriggerStyle` | `class-variance-authority` `lucide-react` `radix-ui` |  | `navigation-menu` `navigation-menu-list` `navigation-menu-item` `navigation-menu-trigger` +4 | 169 |
| `pagination.tsx` | `Pagination` `PaginationContent` `PaginationLink` `PaginationItem` `PaginationPrevious` `PaginationNext` `PaginationEllipsis` | `lucide-react` |  | `pagination` `pagination-content` `pagination-item` `pagination-link` +1 | 128 |
| `popover.tsx` | `Popover` `PopoverTrigger` `PopoverContent` `PopoverAnchor` `PopoverHeader` `PopoverTitle` `PopoverDescription` | `radix-ui` |  | `popover` `popover-trigger` `popover-content` `popover-anchor` +3 | 90 |
| `progress.tsx` | `Progress` | `radix-ui` |  | `progress` `progress-indicator` | 33 |
| `radio-group.tsx` | `RadioGroup` `RadioGroupItem` | `lucide-react` `radix-ui` |  | `radio-group` `radio-group-item` `radio-group-indicator` | 46 |
| `resizable.tsx` | `ResizableHandle` `ResizablePanel` `ResizablePanelGroup` | `lucide-react` `react-resizable-panels` |  | `resizable-panel-group` `resizable-panel` `resizable-handle` | 54 |
| `scroll-area.tsx` | `ScrollArea` `ScrollBar` | `radix-ui` |  | `scroll-area` `scroll-area-viewport` `scroll-area-scrollbar` `scroll-area-thumb` | 59 |
| `select.tsx` | `Select` `SelectContent` `SelectGroup` `SelectItem` `SelectLabel` `SelectScrollDownButton` `SelectScrollUpButton` `SelectSeparator` `SelectTrigger` `SelectValue` | `lucide-react` `radix-ui` |  | `select` `select-group` `select-value` `select-trigger` +7 | 191 |
| `separator.tsx` | `Separator` | `radix-ui` |  | `separator` | 29 |
| `sheet.tsx` | `Sheet` `SheetTrigger` `SheetClose` `SheetContent` `SheetHeader` `SheetFooter` `SheetTitle` `SheetDescription` | `lucide-react` `radix-ui` |  | `sheet` `sheet-trigger` `sheet-close` `sheet-portal` +6 | 144 |
| `sidebar.tsx` | `Sidebar` `SidebarContent` `SidebarFooter` `SidebarGroup` `SidebarGroupAction` `SidebarGroupContent` `SidebarGroupLabel` `SidebarHeader` `SidebarInput` `SidebarInset` `SidebarMenu` `SidebarMenuAction` `SidebarMenuBadge` `SidebarMenuButton` `SidebarMenuItem` `SidebarMenuSkeleton` `SidebarMenuSub` `SidebarMenuSubButton` `SidebarMenuSubItem` `SidebarProvider` `SidebarRail` `SidebarSeparator` `SidebarTrigger` `useSidebar` | `class-variance-authority` `lucide-react` `radix-ui` | ● | `sidebar-wrapper` `sidebar` `sidebar-gap` `sidebar-container` +22 | 724 |
| `skeleton.tsx` | `Skeleton` | — |  | `skeleton` | 14 |
| `slider.tsx` | `Slider` | `radix-ui` |  | `slider` `slider-track` `slider-range` `slider-thumb` | 64 |
| `sonner.tsx` | `Toaster` | `lucide-react` `next-themes` `sonner` |  | — | 41 |
| `spinner.tsx` | `Spinner` | `lucide-react` |  | — | 17 |
| `switch.tsx` | `Switch` | `radix-ui` |  | `switch` `switch-thumb` | 36 |
| `table.tsx` | `Table` `TableHeader` `TableBody` `TableFooter` `TableHead` `TableRow` `TableCell` `TableCaption` | — |  | `table-container` `table` `table-header` `table-body` +5 | 117 |
| `tabs.tsx` | `Tabs` `TabsList` `TabsTrigger` `TabsContent` `tabsListVariants` | `class-variance-authority` `radix-ui` | ● | `tabs` `tabs-list` `tabs-trigger` `tabs-content` | 92 |
| `textarea.tsx` | `Textarea` | — |  | `textarea` | 19 |
| `toggle-group.tsx` | `ToggleGroup` `ToggleGroupItem` | `class-variance-authority` `radix-ui` |  | `toggle-group` `toggle-group-item` | 84 |
| `toggle.tsx` | `Toggle` `toggleVariants` | `class-variance-authority` `radix-ui` | ● | `toggle` | 48 |
| `tooltip.tsx` | `Tooltip` `TooltipTrigger` `TooltipContent` `TooltipProvider` | `radix-ui` |  | `tooltip-provider` `tooltip` `tooltip-trigger` `tooltip-content` | 58 |

## Reuse notes, by group

### Navigation & disclosure

- **`accordion.tsx`** — FAQ, spec sheets, filters in a sidebar. Pairs with the `note-tabs` idea on this site for product details.
  - *Watch:* Animated with the `accordion-down/up` keyframes that live in `vendor/shadcn-tailwind-4.13.0.css` — import that file or the height animation snaps.
  - *Import:* `Accordion, AccordionItem, AccordionTrigger, AccordionContent` from `@/components/ui/accordion`
- **`breadcrumb.tsx`** — Category pages once the catalogue grows past one product.
  - *Watch:* Remember `aria-current="page"` on the last item — the component sets it for you.
  - *Import:* `Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis` from `@/components/ui/breadcrumb`
- **`collapsible.tsx`** — Read-more on the journal cards without a modal.
  - *Watch:* Trigger must stay inside `Collapsible` — outside it the chevron rotation loses its state.
  - *Import:* `Collapsible, CollapsibleTrigger, CollapsibleContent` from `@/components/ui/collapsible`
- **`menubar.tsx`** — Desktop app-style menu bar in a dashboard shell.
  - *Watch:* Overkill for marketing pages; keep it in the admin bundle only.
  - *Import:* `Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent` from `@/components/ui/menubar`
- **`navigation-menu.tsx`** — Mega-menu in the header (this site's `.nav-left` is a stub of the idea).
  - *Watch:* Keyboard grid navigation comes free; the styling layer is what takes time.
  - *Import:* `NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle` from `@/components/ui/navigation-menu`
- **`pagination.tsx`** — Journal listing once there are more than two entries.
  - *Watch:* Ellipsis logic lives in `PaginationEllipsis`.
  - *Import:* `Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis` from `@/components/ui/pagination`
- **`sidebar.tsx`** — Full app sidebar: collapsible, mobile sheet, persistence, active state, `useSidebar()`.
  - *Watch:* 723 lines and the only component that owns state + context + localStorage. Lift it deliberately, not casually — but it saves a week in an admin UI.
  - *Import:* `Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar` from `@/components/ui/sidebar`

### Overlays & popups

- **`alert-dialog.tsx`** — Destructive confirmations (clear cart, delete draft). 12 exports including `AlertDialogMedia`.
  - *Watch:* Focus is trapped and the dialog is modal by default — never nest it inside another modal host.
  - *Import:* `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog`
- **`command.tsx`** — ⌘K palette. Direct upgrade path from this site's hand-written search panel.
  - *Watch:* `cmdk` handles fuzzy matching for free — the site's substring `keywords` approach exists only to avoid this dep.
  - *Import:* `Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator` from `@/components/ui/command`
- **`context-menu.tsx`** — Right-click actions in an admin/editor surface.
  - *Watch:* Not for touch-first marketing pages.
  - *Import:* `ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup` from `@/components/ui/context-menu`
- **`dialog.tsx`** — Product quick-view. Compare with the site's single-`<dialog>` multiplexer (see part 2).
  - *Watch:* Radix traps focus and restores it on close; if you animate with GSAP, disable `exit` while ScrollTrigger still holds the layout.
  - *Import:* `Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger` from `@/components/ui/dialog`
- **`drawer.tsx`** — Mobile bottom sheet for the bag/filter panel — exactly what this site approximates with `.side-modal`.
  - *Watch:* Uses `vaul` on top of `@react-spring`; it renders through a portal, so `data-lenis-prevent` must be applied to its scroll body.
  - *Import:* `Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription` from `@/components/ui/drawer`
- **`dropdown-menu.tsx`** — Locale switcher, account menu, multi-select filters.
  - *Watch:* Checkboxes/radios inside a menu are first-class here (`DropdownMenuCheckboxItem`).
  - *Import:* `DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent` from `@/components/ui/dropdown-menu`
- **`hover-card.tsx`** — Note preview on hover in the composition section.
  - *Watch:* Never rely on hover-only for essential info — no hover on touch.
  - *Import:* `HoverCard, HoverCardTrigger, HoverCardContent` from `@/components/ui/hover-card`
- **`popover.tsx`** — Sizing help text, colour swatch detail, mini-cart preview.
  - *Watch:* Focus trap is off by default (`trapFocus={false}`) — set it if the content has inputs.
  - *Import:* `Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription` from `@/components/ui/popover`
- **`sheet.tsx`** — Side panel for filters or bag. Five side positions.
  - *Watch:* Same caution as drawer: portal + body scroll lock collide with Lenis.
  - *Import:* `Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription` from `@/components/ui/sheet`
- **`tooltip.tsx`** — Icon-only button labels.
  - *Watch:* Needs a `TooltipProvider` ancestor; the file exports one — mount it once at the root.
  - *Import:* `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`

### Feedback & status

- **`alert.tsx`** — Inline validation summary, out-of-stock banner.
  - *Watch:* Has `cva` variants (`default | destructive`) — extend the variant map instead of overriding class strings.
  - *Import:* `Alert, AlertTitle, AlertDescription` from `@/components/ui/alert`
- **`badge.tsx`** — 'New', 'Limited edition', stock status. Four exports incl. `badgeVariants`.
  - *Watch:* Export `badgeVariants` and reuse it in your own `cva` compositions instead of copying classes.
  - *Import:* `Badge, badgeVariants` from `@/components/ui/badge`
- **`empty.tsx`** — Empty search results, empty cart, 'no posts yet'. Six exports incl. `emptyMediaVariants`.
  - *Watch:* Prefer it over hand-rolled empty markup — the media/title/description grid is what makes it look intentional.
  - *Import:* `Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia` from `@/components/ui/empty`
- **`progress.tsx`** — Upload and checkout steps; also a nice analogue for this site's intro curtain line.
  - *Watch:* Needs a `value` update loop if it should animate while indeterminate.
  - *Import:* `Progress` from `@/components/ui/progress`
- **`skeleton.tsx`** — Suspense fallbacks; matches the site's preloader aesthetic better than a spinner.
  - *Watch:* Pair with `prefers-reduced-motion` (the pulse is animation).
  - *Import:* `Skeleton` from `@/components/ui/skeleton`
- **`sonner.tsx`** — Production-grade toasts (stacking, promises, action buttons) — replaces this site's 3-line `toast` state.
  - *Watch:* Needs `sonner` + `next-themes` and one `<Toaster/>` mounted in the layout.
  - *Import:* `Toaster` from `@/components/ui/sonner`
- **`spinner.tsx`** — Loading state on a button.
  - *Watch:* 4 lines of styling on top of `animate-spin`.
  - *Import:* `Spinner` from `@/components/ui/spinner`

### Data display

- **`aspect-ratio.tsx`** — Lock product imagery to a design ratio so scroll parallax never shifts layout.
  - *Watch:* Trivial wrapper; the real win is combining it with explicit `width`/`height` to stay CLS-free.
  - *Import:* `AspectRatio` from `@/components/ui/aspect-ratio`
- **`avatar.tsx`** — Reviewer initials, testimonial rows, fallback when a photo 404s.
  - *Watch:* Needs the `radix-ui` Avatar primitive plus a `Fallback` delay if images are slow.
  - *Import:* `Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount` from `@/components/ui/avatar`
- **`card.tsx`** — Journal/news cards, product tiles, admin tiles.
  - *Watch:* Composition-only: CardHeader/Title/Description/Action/Content/Footer — bring all the parts you style.
  - *Import:* `Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent` from `@/components/ui/card`
- **`carousel.tsx`** — Gallery of product shots, testimonial slider.
  - *Watch:* Wrap-around state uses `embla-carousel-react`; also needs the lucide chevrons and `useCarousel()` context — the whole file is the unit, not individual exports.
  - *Import:* `type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext` from `@/components/ui/carousel`
- **`chart.tsx`** — Dashboards: sales by note family, traffic by locale.
  - *Watch:* The most coupled file here (377 lines, `recharts`, a `ChartConfig` type, tooltip primitives). Bring it whole and edit `ChartContainer`, never the internals.
  - *Import:* `ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle` from `@/components/ui/chart`
- **`item.tsx`** — Dense list rows: order line items, wishlist entries, bag contents.
  - *Watch:* Good replacement for the bespoke `.bag-item` markup on this site.
  - *Import:* `Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter` from `@/components/ui/item`
- **`resizable.tsx`** — Split view in a back-office (editor + preview).
  - *Watch:* Wraps `react-resizable-panels`; persisted layout needs your own storage code.
  - *Import:* `ResizableHandle, ResizablePanel, ResizablePanelGroup` from `@/components/ui/resizable`
- **`scroll-area.tsx`** — Custom-scrollbar panel inside a fixed-height modal list.
  - *Watch:* Beware the interaction with Lenis: mark the scroll node `data-lenis-prevent` or smooth scroll fights it.
  - *Import:* `ScrollArea, ScrollBar` from `@/components/ui/scroll-area`
- **`table.tsx`** — Spec tables, order history, admin grids.
  - *Watch:* No virtualisation — add `@tanstack/react-table` if rows grow.
  - *Import:* `Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption` from `@/components/ui/table`

### Chat / agent surface

- **`attachment.tsx`** — File chips in an upload area or a composer.
  - *Watch:* Part of the chat family; assumes the `data-slot` styling layer.
  - *Import:* `Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction, AttachmentTrigger` from `@/components/ui/attachment`
- **`bubble.tsx`** — Message bubbles with reaction row — useful for any conversational support widget.
  - *Watch:* Chat family: needs the `bubble-content` / `bubble-reactions` data-slots from the theme layer.
  - *Import:* `BubbleGroup, Bubble, BubbleContent, BubbleReactions` from `@/components/ui/bubble`
- **`marker.tsx`** — Inline 'assistant is thinking' / step marker in a timeline.
  - *Watch:* Chat family; `markerVariants` covers sizes.
  - *Import:* `Marker, MarkerIcon, MarkerContent, markerVariants` from `@/components/ui/marker`
- **`message-scroller.tsx`** — Auto-scrolling transcript container for streaming output.
  - *Watch:* Provider + viewport + rails: lift all four exports together.
  - *Import:* `MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton, useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility` from `@/components/ui/message-scroller`
- **`message.tsx`** — One chat row: avatar, name, content, actions.
  - *Watch:* Chat family.
  - *Import:* `MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader` from `@/components/ui/message`

### Controls & selection

- **`button-group.tsx`** — Segmented size picker (30/50/100 ml), unit toggles.
  - *Watch:* Handles border collapsing between siblings; don't add margins yourself.
  - *Import:* `ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants` from `@/components/ui/button-group`
- **`button.tsx`** — Every CTA. `buttonVariants` also lets you style an `<a>` as a button.
  - *Watch:* The site's own `.pill` (globals.css) is a hand-written alternative — pick one system per project, not both.
  - *Import:* `Button, buttonVariants` from `@/components/ui/button`
- **`combobox.tsx`** — Autocomplete shade/skin-type selectors.
  - *Watch:* This one is built on `@base-ui/react`, not Radix, so its data attributes differ from the rest of the folder.
  - *Import:* `Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxEmpty, ComboboxSeparator, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxTrigger, ComboboxValue, useComboboxAnchor` from `@/components/ui/combobox`
- **`native-select.tsx`** — A real `<select>` styled to match — form-safe on mobile and for keyboards.
  - *Watch:* Use this before `select.tsx`: no portal, no focus trap, no JS. The site's language switcher does exactly this by hand.
  - *Import:* `NativeSelect, NativeSelectOptGroup, NativeSelectOption` from `@/components/ui/native-select`
- **`radio-group.tsx`** — Single choice among 3–5 options (concentration, size).
  - *Watch:* Give every item an `id` + `Label`, or it's inaccessible.
  - *Import:* `RadioGroup, RadioGroupItem` from `@/components/ui/radio-group`
- **`select.tsx`** — Styled select with search-free option list, groups and labels.
  - *Watch:* Heavier than `native-select.tsx` and worse on mobile keyboards; reach for it only when the design needs per-option layout.
  - *Import:* `Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue` from `@/components/ui/select`
- **`slider.tsx`** — Intensity/longevity filters in a fragrance finder.
  - *Watch:* Radix slider needs an accessible label; the wrapper does not add one.
  - *Import:* `Slider` from `@/components/ui/slider`
- **`switch.tsx`** — Boolean settings in a dashboard, 'notify me'.
  - *Watch:* Use a checkbox for anything inside a submitted form — switch semantics confuse assistive tech there.
  - *Import:* `Switch` from `@/components/ui/switch`
- **`tabs.tsx`** — Note tabs (Opening / Heart / Trail) — the site hand-rolls this exact pattern.
  - *Watch:* `tabsListVariants` gives you the trigger-row styling; Radix handles roving focus and arrow keys for free.
  - *Import:* `Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants` from `@/components/ui/tabs`
- **`toggle-group.tsx`** — Multi-select chips (note families, occasion tags).
  - *Watch:* Supports `type="multiple"` and `variant="single"` — same component, two semantics.
  - *Import:* `ToggleGroup, ToggleGroupItem` from `@/components/ui/toggle-group`
- **`toggle.tsx`** — Pressed-state icon buttons (wishlist, compare).
  - *Watch:* `toggleVariants` exposed for size styling.
  - *Import:* `Toggle, toggleVariants` from `@/components/ui/toggle`

### Forms & fields

- **`calendar.tsx`** — Delivery-date pickers, 'when do you need it by'.
  - *Watch:* Depends on `react-day-picker` v10 API plus `date-fns`; heavy (~220 lines) — code-split it out of the landing page bundle.
  - *Import:* `Calendar, CalendarDayButton` from `@/components/ui/calendar`
- **`checkbox.tsx`** — Consent box, filter facets.
  - *Watch:* Native form submission needs a hidden input; the Radix one provides `name`/`value` props.
  - *Import:* `Checkbox` from `@/components/ui/checkbox`
- **`field.tsx`** — Label + control + helper + error in one grid; the layout half of a form system.
  - *Watch:* It is presentation only — pair with `form.tsx` or your own controller for state.
  - *Import:* `Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle` from `@/components/ui/field`
- **`form.tsx`** — react-hook-form wiring (`Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`).
  - *Watch:* Needs `react-hook-form` + `@hookform/resolvers` + `zod` to be worth the weight; three deps for one component.
  - *Import:* `useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField` from `@/components/ui/form`
- **`input-group.tsx`** — Search field with leading icon and trailing clear/kbd; quantity inputs with unit suffix.
  - *Watch:* Addon positioning uses `data-slot` + `group` classes; the addon is an absolute-positioned sibling, so pad the input yourself if you change sizes.
  - *Import:* `InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea` from `@/components/ui/input-group`
- **`input-otp.tsx`** — 6-digit verification for a membership or a locker code.
  - *Watch:* Needs `input-otp` and registers its own clipboard/paste handling; paste works because of that lib, not the wrapper.
  - *Import:* `InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator` from `@/components/ui/input-otp`
- **`input.tsx`** — Plain text input, 21 lines, zero deps.
  - *Watch:* The most portable file in the folder — copy-paste into any project.
  - *Import:* `Input` from `@/components/ui/input`
- **`label.tsx`** — Accessible labels for Radix controls (wires `htmlFor`/`id`).
  - *Watch:* Also used here for the language select in the header.
  - *Import:* `Label` from `@/components/ui/label`
- **`textarea.tsx`** — Message box, review body.
  - *Watch:* Autosize isn't included; add `field-sizing-content` in Tailwind v4.
  - *Import:* `Textarea` from `@/components/ui/textarea`

### Utility primitives

- **`direction.tsx`** — RTL support — wrap the tree once, every other primitive flips.
  - *Watch:* Only worth lifting if the project actually needs RTL; it's a provider with no styling.
  - *Import:* `DirectionProvider, useDirection` from `@/components/ui/direction`
- **`kbd.tsx`** — Shortcut hints inside the command palette.
  - *Watch:* Needs the `kbd-group` styling to space siblings.
  - *Import:* `Kbd, KbdGroup` from `@/components/ui/kbd`
- **`separator.tsx`** — Rule between footer columns or in menus.
  - *Watch:* One line: `orientation` and `decorative` handled.
  - *Import:* `Separator` from `@/components/ui/separator`

## Part 2 — the site's own components

Everything the page actually renders. Each entry is a pattern you can lift into any marketing site: what it does, where it lives, and the minimum you have to carry over.

These are the 14 patterns that make the page what it is. Every one is anchored by a grep-able name rather than a line number, because line numbers rot and selectors don't.

### 1. Logo curtain / preloader
- **Anchors:** `app/page.tsx` → `.intro-curtain`, state `ready` · `app/globals.css` → `.intro-curtain`, `.is-ready`, `.is-loading`, `@keyframes loading`
- **What it does:** an ivory full-bleed panel with the brand mark, a hairline progress rule and an eyebrow line; it lifts upward once `ready` flips (1800 ms timer, or immediately under `prefers-reduced-motion`).
- **Why it's worth stealing:** it hides font + image loading behind a brand moment instead of a spinner, and costs one div plus one transition.
- **Lift it:** keep the timer, but set `ready` from `document.fonts.ready` + the hero image's `decode()` and use the timeout as a fallback ceiling — that removes the arbitrary 1800 ms wait.

### 2. Scrolled-state header
- **Anchors:** `app/page.tsx` → state `sticky`, `window.scrollY > 60` · `.header`, `.header.is-scrolled`
- **What it does:** transparent over the hero, gains a translucent warm-brown tint once scrolled. Passive scroll listener, no rAF throttle.
- **Watch:** a passive scroll listener doing setState on every pixel is cheap here because the render is tiny; add a `> 60` hysteresis (already present) or a threshold comparison before you copy it into a heavier page.

### 3. Photo-painted wordmark (image → logo, no redraw)
- **Anchors:** `app/page.tsx` → `function Brand()`, inline `<svg>` with `#velora-mark-light` / `#velora-mark-dark` `feColorMatrix` filters · `app/globals.css` → `.brand-crop`
- **What it does:** displays the source photo clipped to a window, then an SVG colour matrix turns luminance into alpha, so a white-on-photo logo becomes a transparent cut-out with zero manual masking. Two filters = light and dark treatments from one asset.
- **Why it's worth stealing:** the fastest way to get a clean mark out of a supplied asset without a design tool.
- **Lift it:** the matrix row `-1.8 -1.8 -1.8 0 3.6` is the alpha row — tune those two numbers to control the threshold and softness. Note the payload cost: it ships the whole 2.2 MB PNG to crop it. Bake an SVG before production.

### 4. Line-mask reveal (`Lines`)
- **Anchors:** `app/page.tsx` → `function Lines`, `.text-mask`, `.reveal-line` · `app/globals.css` → `.text-mask`
- **What it does:** splits a string on `\n`, wraps each line in an overflow-hidden mask and animates the inner span from `yPercent: 110` with `power3.out`, `once: true`.
- **Why it's worth stealing:** it is the single highest-value motion primitive on the page — reads as expensive editorial type, is 12 lines of JSX and one tween.
- **Lift it:** masks must be `overflow: hidden` with `display: block` children or descenders clip. For multi-line paragraphs, don't use this — line breaks are visual, not textual; use per-word or per-character instead.

### 5. Per-word scroll scrub (statement)
- **Anchors:** `app/page.tsx` → `t.statement.split(" ").map(...`, `.statement-word` · `.statement`
- **What it does:** every word becomes a span; opacity scrubs `0.2 → 1` across the section with `stagger: 0.12`, so the sentence "focuses" as you read it.
- **Why it's worth stealing:** the effect is legible in a screenshot and works on any long sentence — hero, manifesto, feature intro.
- **Lift it:** scrubbing (`scrub: 0.6`) means the user controls the playhead; that's why it feels editorial rather than animated. Keep `ease: "none"` on scrubbed tweens or the mapping feels elastic.

### 6. Staggered card grid
- **Anchors:** `app/page.tsx` → `.scent-grid`, `.scent-card` with per-index `y: [150, 260, 170, 240]` · `app/globals.css` → `.peach-card`, `.jasmine-card`, `.bottle-card`, `.wood-card`, `.card-tag`, `.card-plus`
- **What it does:** four cards each start at a different vertical offset and converge to `y: 0` scrubbed to the grid's entry — asymmetric layout that assembles itself.
- **Watch:** the offsets are a positional array indexed by card order. Reorder the markup and the rhythm breaks silently; move the offsets into `data-offset` attributes or the model JSON if this becomes a real component.

### 7. Pinned product stage
- **Anchors:** `app/page.tsx` → `gsap.matchMedia().add("(min-width: 800px)", ...)`, `pin: ".signature-stage"`, `end: "+=1100"` · `.signature-stage`, `.signature-bottle`, `.signature-ghost`, `.signature-info`
- **What it does:** inside a 1100 px scroll track the bottle scales/rotates up, a giant ghost wordmark slides across, and the info column drifts — one timeline, four targets, pinned.
- **Why it's worth stealing:** this is the "product hero you can sell" pattern, and it's gated behind `gsap.matchMedia()` so mobile never runs it.
- **Lift it:** `pin` creates a spacer; any ScrollTrigger measured *after* it (e.g. lazy images loading) needs `ScrollTrigger.refresh()` — the page already schedules refresh on `document.fonts.ready`, `load`, and a 2500 ms timer. Keep all three.

### 8. Ghost/outline typography
- **Anchors:** `app/globals.css` → `.hero-wordmark`, `.signature-ghost`, `.footer-wordmark` (`-webkit-text-stroke` / very large clamp)
- **What it does:** oversized brand word sitting under imagery, animated with parallax rather than entrance.
- **Lift it:** needs `aria-hidden="true"` (it duplicates the brand name) and `clamp()` sizing or it overflows narrow viewports.

### 9. Pointer parallax scene
- **Anchors:** `app/page.tsx` → `.hero-scene` `onPointerMove` / `onPointerLeave`, `gsap.to(..., { duration: 1.6 })`
- **What it does:** the hero image container follows the cursor by ±9 px / ±5 px with heavy easing; guarded by `e.pointerType === "mouse"` and `prefers-reduced-motion`.
- **Why it's worth stealing:** correct pointer gating is the part everyone forgets — no parallax on touch, no nausea.
- **Lift it:** keep the motion under ~1.5% of viewport size and always tween back to 0 on leave, or the scene sticks.

### 10. Ken-Burns image breathing
- **Anchors:** `app/page.tsx` → `.world-image img` (`yPercent` + `scale: 1.15`), `.closing-image` (`scale 1.2 → 1`) · `app/globals.css` → `@keyframes floatDown`
- **What it does:** scroll-scrubbed scale/translate on full-bleed images so photography never sits still.
- **Lift it:** always scale `> 1` first, or scrubbing exposes empty edges at the seam.

### 11. One `<dialog>`, many panels
- **Anchors:** `app/page.tsx` → `type Panel = "search" | "bag" | "product" | "menu" | "journal" | "care" | null`, `dialog` ref, effect calling `showModal()` / `close()`, `onClick` backdrop hit-test · `app/globals.css` → `.modal`, `.side-modal`, `.modal-inner`, `@keyframes dialogIn`, `@keyframes sideIn`
- **What it does:** a single native dialog whose content is switched by the `panel` state — centre modal for product/search/article, `side-modal` for bag/menu. Backdrop click closes because `e.target === e.currentTarget`.
- **Why it's worth stealing:** native `<dialog>` + `showModal()` gives you focus trap, `Esc`, inertness and top-layer stacking for free. One host means one place to handle Lenis pause, focus restore and `aria-label`.
- **Lift it:** the `panel` union type *is* the API — add a variant by adding a key to the union, a conditional block, and an `aria-label` branch. Keep `data-lenis-prevent` on the scrollable inner element.

### 12. Note tabs (accessible, hand-rolled)
- **Anchors:** `app/page.tsx` → `.note-tabs` with `role="tablist"`, state `note` · `app/globals.css` → `.note-tabs`, `.note-description`, `@keyframes noteIn`
- **What it does:** three tabs driving a crossfading description block, keyboard operable.
- **Lift it:** `role="tablist"` is a promise — it requires arrow-key roving focus and `aria-selected`. That's exactly the logic `components/ui/tabs.tsx` (Radix) already implements; use the primitive instead of re-writing it.

### 13. Bag + offline "save my selection"
- **Anchors:** `app/page.tsx` → `updateBag()` (clamped 0..20, mirrors to localStorage), `saveBag()` (Blob → object URL → `a.download` → revoke) · `.quantity`, `<output>`, `.bag-item`, `.pill`
- **What it does:** quantity stepper with persisted state, plus a text-file download of the selection instead of a checkout.
- **Why it's worth stealing:** pre-launch commerce done in ~15 lines with no backend, no fake "order placed" lie, and it hands the customer a tangible artifact.
- **Lift it:** always `URL.revokeObjectURL` after click; `<output>` is the semantically right element for a computed quantity.

### 14. In-page agent tools
- **Anchors:** `app/page.tsx` → effect registering `get_eclat_details` and `set_fragrance_selection` on `document.modelContext`, guarded by `AbortController`
- **What it does:** exposes typed, JSON-schema'd, read-only-or-scoped tools to the browser's AI layer so an assistant can read product facts or set the bag quantity — with `readOnlyHint` annotations and validation that throws on bad input.
- **Why it's worth stealing:** the first place I've seen this shape in a landing page. It degrades to a no-op where `modelContext` is absent, so it costs nothing to keep.
- **Lift it:** keep tool state effects routed through the same setters the UI uses (`updateBag`, `setPanel`) so the AI can't desync the render; always `signal`-abort on unmount.

---

## Cross-cutting behaviours (not components, but you re-implement them every time)

| Concern | Implementation here | Reuse rule |
| --- | --- | --- |
| Smooth scroll | `Lenis({ duration: 1.05, smoothWheel, touchMultiplier: 1, anchors: true })`, fed by `gsap.ticker`, `smooth.on("scroll", ScrollTrigger.update)` | Never run Lenis' own rAF alongside GSAP's — one clock, or the scrub jitters |
| Anchor nav | `go(id)`: close panel → `lenis.scrollTo(id, { offset: -90 })`, fallback `scrollIntoView`, `behavior` chosen by reduced-motion query | Always offset by header height; here `scroll-padding-top: 100px` covers the CSS side |
| Reduced motion | `matchMedia` guard returns early from the whole motion effect and sets `ready` immediately; CSS has a `prefers-reduced-motion` block | Gate at the top of the effect, not per-tween |
| Persistence | `velora-selection`, `velora-language` keys, each read/write inside `try/catch` | Storage throws in private mode and in some embeds; treat every access as fallible |
| Locale | `content` dictionary keyed by `lang`; `document.documentElement.lang` synced in an effect; GSAP effect re-runs on `[lang]` so ScrollTrigger re-measures new text heights | Re-registering triggers on locale change is the bug everyone ships — copy this |
| Toast | `toast` string state + 3200 ms auto-dismiss + `role="status"` | Fine at one per page; reach for `components/ui/sonner.tsx` when you need stacking or actions |
| Live region | `<div className="toast" role="status">` | Announce async results, never decorative state |


## Part 3 — CSS class families

`app/globals.css` is the styling layer for all of the above (no Tailwind utilities in the markup). Family sizes, so you know the blast radius before you lift a pattern:

| Family | Selectors | Rules | Members |
| --- | ---: | ---: | --- |
| `.product-*` | 8 | 8 | `product-caption` `product-size` `product-modal` `product-modal-picture` `product-modal-word` `product-modal-copy` `product-scent` `product-notes` |
| `.hero-*` | 7 | 8 | `hero` `hero-scene` `hero-photo` `hero-shade` `hero-copy` `hero-caption` `hero-wordmark` |
| `.signature-*` | 7 | 7 | `signature` `signature-stage` `signature-ghost` `signature-label` `signature-product` `signature-bottle` `signature-info` |
| `.journal-*` | 7 | 10 | `journal` `journal-heading` `journal-grid` `journal-card` `journal-picture` `journal-circle` `journal-card-info` |
| `.bag-*` | 5 | 5 | `bag-button` `bag-panel` `bag-item` `bag-image` `bag-information` |
| `.footer-*` | 5 | 6 | `footer-top` `footer-service` `footer-wordmark` `footer-bottom` `footer-made` |
| `.world-*` | 4 | 4 | `world` `world-copy` `world-signature` `world-image` |
| `.closing-*` | 4 | 4 | `closing` `closing-image` `closing-shade` `closing-content` |
| `.intro-*` | 3 | 3 | `intro-curtain` `intro-inner` `intro-line` |
| `.nav-*` | 3 | 3 | `nav-left` `nav-right` `nav-tools` |
| `.mobile-*` | 3 | 3 | `mobile-menu` `mobile-panel` `mobile-language` |
| `.card-*` | 3 | 3 | `card-tag` `card-copy` `card-plus` |
| `.composition-*` | 3 | 3 | `composition` `composition-image` `composition-content` |
| `.modal-*` | 3 | 4 | `modal` `modal-inner` `modal-close` |
| `.search-*` | 3 | 3 | `search-panel` `search-input` `search-results` |
| `.header-*` | 2 | 2 | `header` `header-brand` |
| `.pill-*` | 2 | 3 | `pill` `pill-dot` |
| `.notes-*` | 2 | 2 | `notes-section` `notes-foot` |
| `.scent-*` | 2 | 4 | `scent-grid` `scent-card` |
| `.jasmine-*` | 2 | 3 | `jasmine-card` `jasmine-image` |
| `.text-*` | 2 | 3 | `text-mask` `text-link` |
| `.note-*` | 2 | 2 | `note-tabs` `note-description` |
| `.site-*` | 1 | 1 | `site` |
| `.eyebrow-*` | 1 | 1 | `eyebrow` |
| `.skip-*` | 1 | 2 | `skip-link` |
| `.brand-*` | 1 | 1 | `brand-crop` |
| `.icon-*` | 1 | 1 | `icon-button` |
| `.language-*` | 1 | 1 | `language-label` |
| `.scroll-*` | 1 | 1 | `scroll-cue` |
| `.story-*` | 1 | 1 | `story-intro` |
| `.section-*` | 1 | 1 | `section-index` |
| `.tiny-*` | 1 | 1 | `tiny-flower` |
| `.statement-*` | 1 | 1 | `statement` |
| `.wood-*` | 1 | 3 | `wood-card` |
| `.bottle-*` | 1 | 2 | `bottle-card` |
| `.peach-*` | 1 | 2 | `peach-card` |
| `.reveal-*` | 1 | 1 | `reveal-line` |
| `.image-*` | 1 | 1 | `image-caption` |
| `.side-*` | 1 | 1 | `side-modal` |
| `.size-*` | 1 | 1 | `size-option` |
| `.quantity-*` | 1 | 1 | `quantity` |
| `.remove-*` | 1 | 1 | `remove` |
| `.empty-*` | 1 | 1 | `empty-bag` |
| `.article-*` | 1 | 1 | `article-panel` |
| `.care-*` | 1 | 1 | `care-panel` |
| `.toast-*` | 1 | 1 | `toast` |

Total: 106 selectors, 122 rule blocks, 2248 lines.


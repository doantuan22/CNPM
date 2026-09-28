# Egode Phase 1 — Token Map

variables.css là nguồn semantic chuẩn. Tailwind @theme chỉ ánh xạ custom properties; component React và CSS shared tiêu thụ cùng token. Token legacy được giữ dạng alias để không cần migrate mọi page-local class trong Phase 1.

| Vai trò | Token | Giá trị / ánh xạ |
| --- | --- | --- |
| Action primary/hover/active/subtle | --color-action-primary, --color-action-primary-hover, --color-action-primary-active, --color-action-primary-subtle | #2563EB, #1D4ED8, #1E40AF, #EFF6FF |
| Text primary/secondary/muted/disabled/on-action | --color-text-primary, --color-text-secondary, --color-text-muted, --color-text-disabled, --color-text-on-action | #1F2937, #4B5563, #6B7280, #9CA3AF, #FFFFFF |
| Surface page/raised/subtle/selected | --color-surface-page, --color-surface-raised, --color-surface-subtle, --color-surface-selected | #F7F8FA, #FFFFFF, #F1F5F9, #EFF6FF |
| Border default/strong/interactive/focus | --color-border-default, --color-border-strong, --color-border-interactive, --color-border-focus | #E5E7EB, #D1D5DB, primary, primary |
| Semantic state | --color-success, --color-success-subtle, warning/danger/info pairs | Giữ palette hiện hành |
| Typography | --font-family, --font-size-*, --font-weight-*, --line-height-* | Inter, finite role scale used by shared type classes |
| Spacing | --space-1 … --space-16 | Base 4px; scale 4–64px |
| Radius | --radius-control-sm, --radius-control, --radius-surface, --radius-pill | 4px, 8px, 12px, 999px |
| Elevation | --elevation-0 … --elevation-3 | none, subtle, popover, modal |
| Focus | --focus-ring | 2px primary outline with offset |

## Component mapping

- Primary button: action primary/hover/active + text on action.
- Secondary/outline/ghost: neutral surface/text/border, shared focus token.
- Input/Select/Textarea: raised surface, default/interactive border, control radius, field text and focus token.
- Card/table/list: raised/page surface and default border; elevation zero by default.
- Status: semantic foreground + subtle background; retain readable label.
- Tailwind primary, ink, surface and border names map to semantic custom properties.

## Alias and contrast

Keep current color-primary/bg/heading/body/muted/border, radius and shadow names as aliases during migration. New shared UI uses semantic names. Remove aliases only after repo-wide usage is verified in a later pass. Opaque text foreground/background pairs are reviewed in visual QA; translucent legacy combinations are not claimed to be mechanically contrast-audited across every page.

# Lumen design system

Calm, dark-first, one accent. Numbers are the hero; everything else stays quiet. Both clients share the same tokens;
web lives in `src/styles.css` (`@theme`), Android in `ui/Theme.kt` (`Palette`) and `ui/Dimens.kt`.

## Principles
1. One clear path per task. One primary action per screen, in the accent color.
2. Money is the biggest thing on the screen; labels are muted and small.
3. Color carries meaning, never decoration: accent = action and progress, green = good, red = due or destructive, category colors = categories.
4. Both themes are premium. Light uses Cloud Dancer `#F0EEE9`, never pure white.
5. Nothing important is reachable only by a gesture. Touch targets are at least 48dp; icon-only controls have a description.

## Color
| Token | Dark | Light | Use |
|---|---|---|---|
| bg | `#070B12` | `#F0EEE9` | screen background, bar, dialogs |
| ink / fg | `#F5F7FB` | `#151A24` | primary text |
| muted | `#9AA6BD` | `#566074` | secondary text, inactive icons |
| accent / cyan | `#3AD7FF` | `#08779E` | actions, selection, progress |
| accentFrom → accentTo | `#7AF0FF → #1AA4FF` | `#1BA3CC → #08779E` | gradient of the ring, progress bars, Add button |
| onAccent | `#041018` | `#F0EEE9` | text and icons on accent |
| good | `#3DDC97` | `#0E8A5C` | paid, positive |
| danger | `#FF5D73` | `#CF2F49` | due, delete |

Categories (same in both themes): Housing `#2EE6C7`, Savings `#FF8A3D`, Transportation `#4C8DFF`, Food & Drink `#E15CF0`,
Shopping `#8B7CFF`, Entertainment `#F6C445`, Health `#34D399`.

## Type and shape
- Web: Outfit; hero 3.05rem, micro 0.6875rem; card radius 1.35rem. Android: system font; screen titles 28sp, section titles 18–22sp,
  hero amount 36sp, captions 12–13sp.
- Android `Dimens`: screen padding 20dp, card radius 22dp, control radius 16dp, touch target 48dp.
- Cards: ink at 6% over bg, no border. Dividers are avoided; spacing separates.

## Components
- **Bottom bar**: four sections and one raised round Add button in the middle. Always visible. Selected = accent icon and label on a 16% accent indicator.
- **Add button**: 64dp circle, accent gradient (`accentFrom → accentTo`), `onAccent` plus icon, accent glow, stands 20dp above the bar.
- **Month title**: month and year with a ▾; tap opens a year stepper and a 3×4 month grid. Shared by Home and Insights.
- **History**: a collapsed section header with the count and ▾/▴; expanded rows show title, category · date, amount, and ✕ to delete.
- **Progress bar**: 8dp, rounded, accent gradient on ink 8%. Used for a project's paid share.
- **Row (`TxRow`)**: title truncates, amount stays; subtitle muted 13sp. Paid rows ✓ in good, due rows amount in danger.
- **Dialogs** (`FormDialog`): bg surface, title 20sp, accent confirm, muted cancel. Dates use the system date picker.
- **Choice chips**: 48dp, accent fill when selected.

## Changes in 0.2.0
- Palette gained `accentFrom`, `accentTo` and `danger`; the budget ring now uses the palette gradient (it was a fixed dark-theme cyan, wrong in Light).
- Android category colors now match web (Entertainment and Health had fallen back to Shopping's purple).
- `Dimens` introduced for shared sizes; new code uses it instead of literals.
- Raised accent Add button replaces the small outlined bar item.

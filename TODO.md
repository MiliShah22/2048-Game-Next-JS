# 2048 Theme Cycle Fix Progress

## Plan Breakdown
1. ✅ [Complete] Create this TODO.md
2. ✅ Update components/theme-provider.tsx: Limit to day/night, disable system
3. ✅ Update components/Header.tsx: Cycle only day/night, simplify icons/logic
4. ✅ Update app/globals.css: Convert data-[theme=...] to .day/.night class selectors, remove aurora
5. ✅ Test: Restart dev server, verify button cycles colors (bg/fg/grid changes)
**Task Complete**: Theme cycling fixed - button toggles between day (light) and night (dark) themes, changing colors via CSS vars.

Run `pnpm dev` to test locally. Theme button in Header toggles background, foreground, grid, glass effects etc.


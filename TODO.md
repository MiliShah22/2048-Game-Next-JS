# Performance Optimization TODO
Status: Approved Plan - Making 2048 smooth (60 FPS target)

## Breakdown from Approved Plan:

### Phase 1: React Optimizations [3/3] ✅
- [x] 1.1 Memoize GameCell.tsx with React.memo ✅
- [x] 1.2 Add useMemo to GameBoard.tsx cell rendering ✅ (cuts cell recomputes)
- [x] 1.3 useReducer(boardState) + .game-active class toggle in Game.tsx ✅ (1 dispatch/move, CSS perf hook)

### Phase 2: CSS Optimizations [3/3] ✅
- [x] 2.1 Paused body::before/::after + orbs + noise under .game-active ✅ (frees GPU)
- [x] 2.2 Reduced grid blur(20→12px), shadows, added will-change ✅
- [x] 2.3 Shortened popIn/mergePulse to 150ms, simplified keyframes ✅

### Phase 2: CSS Optimizations [ ]
- [ ] 2.1 Add .game-active rules in globals.css (pause body anims/orbs/noise)
- [ ] 2.2 Optimize cell CSS (reduce blur/shadows, will-change: transform)
- [ ] 2.3 Shorten anim durations to 120-150ms

### Phase 3: Test & Polish [ ]
- [ ] 3.1 `npm run dev`; Chrome Perf tab record 10 moves (target 60 FPS)
- [ ] 3.2 Verify swipe/keyboard/visuals
- [ ] 3.3 Complete

**Progress: React fixed. Phase 2 CSS next (biggest perf gain).**


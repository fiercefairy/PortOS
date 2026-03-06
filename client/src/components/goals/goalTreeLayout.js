// Tiered radial layout: lifetime/north-star goals at center, shorter horizons in outer rings
// Sub-goals cluster near their parents

// Deterministic pseudo-random based on goal id (seeded hash)
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

const HORIZON_RING = {
  'lifetime': 0,
  '20-year': 1,
  '10-year': 2,
  '5-year': 3,
  '3-year': 4,
  '1-year': 5
};

const RING_RADIUS = 8;
const Y_SPREAD = 4;

export function layoutGoalNodes(flatGoals) {
  if (!flatGoals?.length) return { nodes: [], edges: [] };

  const goalMap = new Map(flatGoals.map(g => [g.id, g]));

  // Group by ring tier
  const rings = {};
  for (const goal of flatGoals) {
    const ring = HORIZON_RING[goal.horizon] ?? 3;
    if (!rings[ring]) rings[ring] = [];
    rings[ring].push(goal);
  }

  const positioned = new Map();

  // Position nodes ring by ring
  for (const [ringStr, goals] of Object.entries(rings)) {
    const ring = Number(ringStr);
    const radius = ring * RING_RADIUS;
    const count = goals.length;

    goals.forEach((goal, i) => {
      const rng = seededRandom(goal.id);
      const angle = (2 * Math.PI * i) / Math.max(count, 1);
      // If goal has parent that's already positioned, cluster near it
      const parent = goal.parentId ? positioned.get(goal.parentId) : null;
      let x, y, z;

      if (parent && radius > 0) {
        // Offset from parent position with some spread
        const parentAngle = Math.atan2(parent.z, parent.x);
        const spread = Math.PI / (count + 2);
        const childAngle = parentAngle + (i - count / 2) * spread;
        x = Math.cos(childAngle) * radius;
        z = Math.sin(childAngle) * radius;
        y = parent.y + (rng() - 0.5) * Y_SPREAD;
      } else if (radius === 0) {
        // Center ring - small spread
        x = (rng() - 0.5) * 3;
        z = (rng() - 0.5) * 3;
        y = (rng() - 0.5) * Y_SPREAD;
      } else {
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = (rng() - 0.5) * Y_SPREAD;
      }

      positioned.set(goal.id, {
        ...goal,
        x, y, z,
        vx: 0, vy: 0, vz: 0
      });
    });
  }

  const nodes = Array.from(positioned.values());

  // Build edges: parent-child (solid) and tag-based cross-links (dotted)
  const edges = [];

  // Parent-child edges
  for (const goal of flatGoals) {
    if (goal.parentId && positioned.has(goal.parentId)) {
      edges.push({
        source: goal.parentId,
        target: goal.id,
        type: 'parent',
        sourceNode: positioned.get(goal.parentId),
        targetNode: positioned.get(goal.id)
      });
    }
  }

  // Tag cross-link edges (goals sharing tags)
  const tagMap = {};
  for (const goal of flatGoals) {
    for (const tag of (goal.tags || [])) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(goal.id);
    }
  }
  const seenPairs = new Set();
  for (const ids of Object.values(tagMap)) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join(':');
        if (seenPairs.has(key)) continue;
        seenPairs.add(key);
        // Don't add tag edge if parent-child edge already exists
        const a = goalMap.get(ids[i]), b = goalMap.get(ids[j]);
        if (a?.parentId === ids[j] || b?.parentId === ids[i]) continue;
        if (positioned.has(ids[i]) && positioned.has(ids[j])) {
          edges.push({
            source: ids[i],
            target: ids[j],
            type: 'tag',
            sourceNode: positioned.get(ids[i]),
            targetNode: positioned.get(ids[j])
          });
        }
      }
    }
  }

  return { nodes, edges, idMap: positioned };
}

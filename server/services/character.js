/**
 * Character Sheet Service
 * D&D-style character sheet tracking XP, HP, level, damage, rests, and events.
 */

import crypto from 'crypto';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { ensureDir, PATHS } from '../lib/fileUtils.js';
import * as jiraService from './jira.js';
import * as cosService from './cos.js';

const CHARACTER_FILE = path.join(PATHS.data, 'character.json');

// D&D 5e XP thresholds per level
const XP_THRESHOLDS = [
  0,       // Level 1
  300,     // Level 2
  900,     // Level 3
  2700,    // Level 4
  6500,    // Level 5
  14000,   // Level 6
  23000,   // Level 7
  34000,   // Level 8
  48000,   // Level 9
  64000,   // Level 10
  85000,   // Level 11
  100000,  // Level 12
  120000,  // Level 13
  140000,  // Level 14
  165000,  // Level 15
  195000,  // Level 16
  225000,  // Level 17
  265000,  // Level 18
  305000,  // Level 19
  355000   // Level 20
];

/**
 * Calculate level from XP using D&D 5e thresholds
 */
function getLevelFromXP(xp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * Calculate max HP: base 10 + (level * 5)
 */
function getMaxHP(level) {
  return 10 + (level * 5);
}

/**
 * Create default character data
 */
function createDefaultCharacter() {
  const now = new Date().toISOString();
  return {
    name: 'Adventurer',
    class: 'Developer',
    xp: 0,
    hp: 15,
    maxHp: 15,
    level: 1,
    events: [],
    syncedJiraTickets: [],
    syncedTaskIds: [],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Load character data, creating defaults if file doesn't exist
 */
export async function getCharacter() {
  await ensureDir(PATHS.data);
  if (!existsSync(CHARACTER_FILE)) {
    const character = createDefaultCharacter();
    await saveCharacter(character);
    return character;
  }
  const content = await readFile(CHARACTER_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save character data to disk
 */
export async function saveCharacter(data) {
  await ensureDir(PATHS.data);
  data.updatedAt = new Date().toISOString();
  await writeFile(CHARACTER_FILE, JSON.stringify(data, null, 2));
  return data;
}

/**
 * Parse dice notation like "1d8", "2d6+3", "1d20-1"
 * Returns { rolls, modifier, total }
 */
export function rollDice(notation) {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  return { rolls, modifier, total: Math.max(0, total) };
}

/**
 * Add XP and check for level up
 * Returns { character, leveledUp, newLevel }
 */
export async function addXP(amount, source, description) {
  const character = await getCharacter();
  const oldLevel = character.level;

  character.xp += amount;
  character.level = getLevelFromXP(character.xp);
  character.maxHp = getMaxHP(character.level);

  // If leveled up, heal to new max HP
  const leveledUp = character.level > oldLevel;
  if (leveledUp) {
    character.hp = character.maxHp;
    console.log(`🎉 Level up! ${oldLevel} -> ${character.level}`);
  }

  const event = {
    id: crypto.randomUUID(),
    type: 'xp',
    description: description || `Gained ${amount} XP from ${source}`,
    xp: amount,
    damage: 0,
    diceNotation: null,
    diceRolls: [],
    hpRecovered: 0,
    timestamp: new Date().toISOString()
  };

  character.events.push(event);
  await saveCharacter(character);

  console.log(`✨ +${amount} XP (${source}) — total ${character.xp} XP, level ${character.level}`);
  return { character, leveledUp, newLevel: character.level };
}

/**
 * Roll dice and apply damage
 * Returns { character, roll, totalDamage }
 */
export async function takeDamage(diceNotation, description) {
  const character = await getCharacter();
  const roll = rollDice(diceNotation);

  character.hp = Math.max(0, character.hp - roll.total);

  const event = {
    id: crypto.randomUUID(),
    type: 'damage',
    description: description || `Took ${roll.total} damage (${diceNotation})`,
    xp: 0,
    damage: roll.total,
    diceNotation,
    diceRolls: roll.rolls,
    hpRecovered: 0,
    timestamp: new Date().toISOString()
  };

  character.events.push(event);
  await saveCharacter(character);

  console.log(`💥 ${roll.total} damage (${diceNotation}: [${roll.rolls}]+${roll.modifier}) — ${character.hp}/${character.maxHp} HP`);
  return { character, roll, totalDamage: roll.total };
}

/**
 * Take a short or long rest
 * Returns { character, hpRecovered }
 */
export async function takeRest(type) {
  const character = await getCharacter();
  const oldHp = character.hp;

  if (type === 'long') {
    character.hp = character.maxHp;
  } else {
    const recovery = Math.floor(character.maxHp * 0.25);
    character.hp = Math.min(character.maxHp, character.hp + recovery);
  }

  const hpRecovered = character.hp - oldHp;

  const event = {
    id: crypto.randomUUID(),
    type: 'rest',
    description: `${type === 'long' ? 'Long' : 'Short'} rest — recovered ${hpRecovered} HP`,
    xp: 0,
    damage: 0,
    diceNotation: null,
    diceRolls: [],
    hpRecovered,
    timestamp: new Date().toISOString()
  };

  character.events.push(event);
  await saveCharacter(character);

  console.log(`🛏️ ${type} rest — recovered ${hpRecovered} HP (${character.hp}/${character.maxHp})`);
  return { character, hpRecovered };
}

/**
 * Log a custom event with optional XP and/or damage
 */
export async function addEvent(event) {
  const character = await getCharacter();
  const oldLevel = character.level;
  let roll = null;
  let leveledUp = false;

  if (event.xp) {
    character.xp += event.xp;
    character.level = getLevelFromXP(character.xp);
    character.maxHp = getMaxHP(character.level);
    leveledUp = character.level > oldLevel;
    if (leveledUp) {
      character.hp = character.maxHp;
    }
  }

  if (event.diceNotation) {
    roll = rollDice(event.diceNotation);
    character.hp = Math.max(0, character.hp - roll.total);
  }

  const logEntry = {
    id: crypto.randomUUID(),
    type: 'custom',
    description: event.description,
    xp: event.xp || 0,
    damage: roll ? roll.total : 0,
    diceNotation: event.diceNotation || null,
    diceRolls: roll ? roll.rolls : [],
    hpRecovered: 0,
    timestamp: new Date().toISOString()
  };

  character.events.push(logEntry);
  await saveCharacter(character);

  console.log(`📝 Custom event: ${event.description}`);
  return { character, event: logEntry, leveledUp };
}

/**
 * Sync JIRA tickets for XP — awards XP for Done tickets not already tracked
 */
export async function syncJiraXP() {
  const character = await getCharacter();
  const config = await jiraService.getInstances();
  const instances = config.instances || {};
  let totalXP = 0;
  let ticketCount = 0;

  for (const [instanceId, instance] of Object.entries(instances)) {
    // Get projects for this instance
    let projects;
    try {
      projects = await jiraService.getProjects(instanceId);
    } catch {
      console.log(`⚠️ Could not fetch projects for JIRA instance ${instanceId}`);
      continue;
    }

    for (const project of projects) {
      let tickets;
      try {
        tickets = await jiraService.getMyCurrentSprintTickets(instanceId, project.key);
      } catch {
        console.log(`⚠️ Could not fetch tickets for ${project.key}`);
        continue;
      }
      const doneTickets = tickets.filter(t =>
        t.statusCategory === 'Done' || t.status === 'Done'
      );

      for (const ticket of doneTickets) {
        if (character.syncedJiraTickets.includes(ticket.key)) continue;

        const xp = (ticket.storyPoints || 1) * 50;
        character.xp += xp;
        totalXP += xp;
        ticketCount++;

        character.syncedJiraTickets.push(ticket.key);

        character.events.push({
          id: crypto.randomUUID(),
          type: 'xp',
          description: `JIRA ${ticket.key}: ${ticket.summary} (${ticket.storyPoints || 0} pts)`,
          xp,
          damage: 0,
          diceNotation: null,
          diceRolls: [],
          hpRecovered: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Recalculate level after all XP added
  const oldLevel = character.level;
  character.level = getLevelFromXP(character.xp);
  character.maxHp = getMaxHP(character.level);
  const leveledUp = character.level > oldLevel;
  if (leveledUp) {
    character.hp = character.maxHp;
  }

  await saveCharacter(character);

  console.log(`🎫 Synced ${ticketCount} JIRA tickets for ${totalXP} XP`);
  return { character, ticketCount, totalXP, leveledUp };
}

/**
 * Sync CoS tasks for XP — awards 25 XP for completed tasks not already tracked
 */
export async function syncTaskXP() {
  const character = await getCharacter();
  const { user: userTasks, cos: cosTasks } = await cosService.getAllTasks();
  let totalXP = 0;
  let taskCount = 0;

  const allTasks = [
    ...(userTasks.tasks || []),
    ...(cosTasks.tasks || [])
  ];

  const completedTasks = allTasks.filter(t => t.status === 'completed');

  for (const task of completedTasks) {
    if (character.syncedTaskIds.includes(task.id)) continue;

    const xp = 25;
    character.xp += xp;
    totalXP += xp;
    taskCount++;

    character.syncedTaskIds.push(task.id);

    character.events.push({
      id: crypto.randomUUID(),
      type: 'xp',
      description: `Task: ${task.title || task.description || task.id}`,
      xp,
      damage: 0,
      diceNotation: null,
      diceRolls: [],
      hpRecovered: 0,
      timestamp: new Date().toISOString()
    });
  }

  // Recalculate level after all XP added
  const oldLevel = character.level;
  character.level = getLevelFromXP(character.xp);
  character.maxHp = getMaxHP(character.level);
  const leveledUp = character.level > oldLevel;
  if (leveledUp) {
    character.hp = character.maxHp;
  }

  await saveCharacter(character);

  console.log(`✅ Synced ${taskCount} tasks for ${totalXP} XP`);
  return { character, taskCount, totalXP, leveledUp };
}

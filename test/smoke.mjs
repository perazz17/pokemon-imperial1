import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, OverworldController, D } from '../src/index.js';

test('world extraction builds the V78 starting map', () => {
  const game = new Game(() => 0.99);
  game.fresh('Test', 'Ignivar');
  assert.equal(game.maps.home.id, 'home');
  assert.equal(game.maps.r0.pool.includes('Bidoof'), true);
});

test('battle extraction keeps type effectiveness and capture flow available', () => {
  const game = new Game(() => 0);
  game.fresh('Test', 'Elaris');
  const water = game.mon('Bidoof', 5);
  assert.equal(game.effect('Water', water), 1);
  game.startBattle({ kind: 'wild', name: 'Bidoof', team: [['Bidoof', 5]] });
  assert.equal(typeof game.turn, 'function');
  assert.equal(typeof game.finish, 'function');
});

test('overworld controller handles collision, NPC interaction, transitions and battle return', () => {
  const game = new Game(() => 0);
  const world = new OverworldController(game);
  world.start('Ari', 'Terram');
  game.state.x = 1; game.state.y = 1;
  assert.equal(world.move(-1, 0).type, 'blocked');
  game.state.x = 9; game.state.y = 11; game.state.face = 'up';
  const npc = world.interact();
  assert.equal(npc.type, 'interacted');
  assert.match(npc.result.message, /Professor Vannaccius/);
  game.state.x = 13; game.state.y = 2;
  const transition = world.move(0, -1);
  assert.equal(transition.type, 'map-changed');
  assert.equal(game.state.map, 'r0');
  const route = game.maps.r0;
  let tall;
  for (let y = 0; y < route.h; y++) for (let x = 0; x < route.w; x++) if (route.grid[y][x] === 'tall') tall = [x, y];
  game.state.x = tall[0] - 1; game.state.y = tall[1];
  const encounter = world.move(1, 0);
  assert.equal(encounter.type, 'battle-started');
  assert.ok(game.state.battle);
  game.state.battle.over = true;
  world.leaveBattle();
  assert.equal(game.state.battle, null);
});

test('real V78 early route, Fioren gym puzzle and leader battle are reachable', () => {
  const game = new Game(() => 0.99);
  const world = new OverworldController(game);
  world.start('Ari', 'Terram');
  game.state.x = 13; game.state.y = 2;
  world.move(0, -1);
  game.state.x = 13; game.state.y = 2;
  world.move(0, -1);
  assert.equal(game.state.map, 'c0');
  game.state.x = 13; game.state.y = 6;
  world.move(0, -1);
  assert.equal(game.state.map, 'g0');
  const gym = game.maps.g0;
  const trainer = gym.objects.find(object => object.kind === 'trainer');
  const trainerEvent = game.interact(trainer);
  assert.equal(trainerEvent.battle, true);
  game.state.battle.over = true;
  world.leaveBattle();
  for (const index of [0, 1, 2]) {
    const result = game.interact(gym.objects.find(object => object.kind === 'switch' && object.index === index));
    assert.match(result.message, /meccanismo|Ragnatela/);
  }
  assert.deepEqual(game.state.puzzles[0], [0, 1, 2]);
  const leaderEvent = game.interact(gym.objects.find(object => object.kind === 'leader'));
  assert.equal(leaderEvent.battle, true);
  assert.equal(game.state.battle.context.kind, 'gym');
  game.finish('win', []);
  assert.deepEqual(game.state.badges, [0]);
  world.leaveBattle();
  assert.equal(game.state.battle, null);
});

test('battle controller delegates moves, KO, capture, run and overworld return to V78 engine', () => {
  const game = new Game(() => 0);
  const world = new OverworldController(game);
  world.start('Ari', 'Terram');
  game.startBattle({ kind: 'wild', name: 'Bidoof', team: [['Bidoof', 5]] });
  const enemy = game.state.battle.enemies[0];
  const hp = enemy.hp;
  world.battleAction({ kind: 'move', move: game.state.party[0].moves[0] });
  assert.ok(enemy.hp < hp);
  enemy.hp = 1;
  const ko = world.battleAction({ kind: 'move', move: game.state.party[0].moves[0] });
  assert.equal(ko.type, 'battle-finished');
  assert.equal(game.state.battle.result, 'win');
  world.leaveBattle();
  assert.equal(game.state.battle, null);
  game.startBattle({ kind: 'wild', name: 'Bidoof', team: [['Bidoof', 5]] });
  const captured = world.battleAction({ kind: 'catch', item: 'ball' });
  assert.equal(captured.type, 'battle-finished');
  assert.equal(game.state.battle.result, 'capture');
  world.leaveBattle();
  game.startBattle({ kind: 'wild', name: 'Bidoof', team: [['Bidoof', 5]] });
  const escaped = world.battleAction({ kind: 'run' });
  assert.equal(escaped.type, 'battle-finished');
  assert.equal(game.state.battle.result, 'run');
  world.leaveBattle();
  assert.equal(game.state.battle, null);
});

test('second V78 city and gym remain gated by the Fioren medal and use its real cart puzzle', () => {
  const game = new Game(() => 0.99);
  const world = new OverworldController(game);
  world.start('Ari', 'Terram');
  game.state.badges = [0];
  game.enter('c0', 13, 2);
  assert.equal(world.move(0, -1).type, 'map-changed');
  assert.equal(game.state.map, 'r1');
  const rival = game.interact(game.maps.r1.objects.find(object => object.id === 'event-rival'));
  assert.equal(rival.battle, true);
  game.finish('win', []);
  world.leaveBattle();
  game.state.x = 13; game.state.y = 2;
  world.move(0, -1);
  assert.equal(game.state.map, 'c1');
  game.state.x = 13; game.state.y = 6;
  world.move(0, -1);
  assert.equal(game.state.map, 'g1');
  const gym = game.maps.g1;
  const use = index => game.interact(gym.objects.find(object => object.kind === 'switch' && object.index === index));
  use(2); use(1); use(1); use(1);
  const solved = use(2);
  assert.match(solved.message, /risolto/);
  assert.deepEqual(game.state.puzzles[1], [0, 1, 2]);
  const leader = game.interact(gym.objects.find(object => object.kind === 'leader'));
  assert.equal(leader.battle, true);
  assert.equal(game.state.battle.context.kind, 'gym');
});

test('battle status turns and recovery are deterministic and usable', () => {
  const game = new Game(() => 0);
  game.fresh('Test', 'Terram');
  const mon = game.mon('Bidoof', 5);
  assert.equal(game.applyStatus(mon, 'sleep'), true);
  assert.equal(mon.status, 'sleep');
  mon.statusTurns = 0;
  assert.equal(game.canAct(mon, []), true);
  assert.equal(mon.status, null);
  assert.equal(game.canAct(mon, []), true);
});

test('battle move selection avoids immune damage and considers STAB', () => {
  const game = new Game(() => 0.99);
  game.fresh('Test', 'Terram');
  const attacker = game.mon('Terram', 20);
  const ghost = game.mon('Gastly', 20);
  const choice = game.best(attacker, ghost);
  assert.equal(typeof choice, 'string');
  assert.ok(attacker.moves.includes(choice));
});


test('party management, bag healing and fast travel are functional', () => {
  const game = new Game(() => 0.99);
  game.fresh('Test', 'Terram');
  const second = game.mon('Bidoof', 5);
  game.state.party.push(second);
  game.state.party[0].hp = 1;
  assert.equal(game.useItem('potion', 0).ok, true);
  assert.ok(game.state.party[0].hp > 1);
  assert.equal(game.lead(1), true);
  assert.equal(game.state.party[0].name, 'Bidoof');
  game.state.badges = [0, 1, 2, 3];
  game.state.visited.push('c0');
  assert.equal(game.travel('c0'), true);
  assert.equal(game.state.map, 'c0');
});


test('dungeon encounter pools are themed and secret vaults differ by dungeon', () => {
  const game = new Game(() => 0.99);
  game.fresh('Test', 'Terram');
  const fire = game.maps.d4;
  const ghost = game.maps.d5;
  assert.equal(fire.encounterRate, 0.16);
  assert.ok(fire.pool.some(name => D.species[name].types.includes('Fire')));
  assert.ok(ghost.pool.some(name => D.species[name].types.includes('Ghost')));
  assert.ok(Array.isArray(fire.rarePool));
  assert.ok(game.maps.d4secret.objects.some(object => object.kind === 'item'));
  assert.ok(game.maps.d7secret.objects.some(object => object.kind === 'npc'));
});

test('dungeons contain an optional three-sigil vault with a real reward room', () => {
  const game = new Game(() => 0.99);
  game.fresh('Test', 'Terram');
  game.enter('d0', 13, 14);
  const dungeon = game.maps.d0;
  const door = dungeon.objects.find(object => object.kind === 'door' && object.gate === 'dungeon-secret-0');
  assert.equal(game.interact(door).message, 'Passaggio ancora chiuso.');
  const sigils = dungeon.objects.filter(object => object.kind === 'dungeonSwitch').sort((a,b) => a.index-b.index);
  assert.equal(sigils.length, 3);
  assert.match(game.interact(sigils[0]).message, /Sigillo 1\/3/);
  assert.match(game.interact(sigils[1]).message, /Sigillo 2\/3/);
  const opened = game.interact(sigils[2]);
  assert.match(opened.message, /porta segreta/);
  assert.equal(game.state.flags['dungeon-secret-0'], true);
  assert.equal(game.interact(door).travel, true);
  assert.equal(game.state.map, 'd0secret');
  const vaultItem = game.maps.d0secret.objects.find(object => object.kind === 'item');
  const reward = game.interact(vaultItem);
  assert.match(reward.message, /Tesoro della cripta/);
});

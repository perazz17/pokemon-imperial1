import assert from 'node:assert/strict';
import { Game, D } from '../src/index.js';

const deterministic = () => 0;
const game = new Game(deterministic);
const state = game.fresh('V78 smoke', 'Terram');

assert.equal(state.party.length, 1);
assert.equal(state.party[0].name, 'Terram');
assert.equal(Object.keys(game.maps).length > 30, true);
assert.equal(game.maps.home.name, 'Borgofoglia');
assert.equal(D.species.Terram.types[0], 'Grass');

const enemy = game.mon('Bidoof', 5);
game.startBattle({ kind: 'wild', name: 'Smoke', team: [['Bidoof', 5]] });
assert.equal(game.state.battle.enemies[0].name, enemy.name);
const damage = game.damage(state.party[0], game.state.battle.enemies[0], state.party[0].moves[0]);
assert.equal(damage.amount >= 1, true);

const encoded = game.serialize();
const restored = new Game(deterministic);
assert.equal(restored.restore(encoded).name, 'V78 smoke');
console.log('V78 modular smoke test passed');
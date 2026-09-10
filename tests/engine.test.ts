import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine";
test("each seven-piece bag contains every shape once", () => {
  const g = new Game("marathon");
  assert.equal(new Set([g.piece.id, ...g.queue.slice(0, 6)]).size, 7);
  assert.equal(new Set(g.queue.slice(6, 13)).size, 7);
});
test("movement respects board walls and ghost rests on floor", () => {
  const g = new Game("marathon");
  for (let i = 0; i < 30; i++) g.move(-1);
  assert.equal(g.piece.x, 0);
  assert.equal(g.move(-1), false);
  assert.equal(g.collides(g.ghost()), false);
  assert.equal(g.collides({ ...g.ghost(), y: g.ghost().y + 1 }), true);
});
test("hold is limited to once per lock and returns held piece", () => {
  const g = new Game("marathon");
  const id = g.piece.id;
  assert.ok(g.hold());
  assert.equal(g.held, id);
  assert.equal(g.hold(), false);
  g.drop();
  assert.ok(g.hold());
  assert.equal(g.piece.id, id);
});
test("clears four lines and awards 800 points", () => {
  const g = new Game("marathon");
  for (let y = 16; y < 20; y++)
    g.board[y] = Array.from({ length: 10 }, (_, x) => (x === 4 ? 0 : 2));
  g.piece = { id: 0, cells: [[1], [1], [1], [1]], x: 4, y: 16 };
  assert.equal(g.lock(), 4);
  assert.equal(g.lines, 4);
  assert.equal(g.score, 800);
  assert.ok(g.board.every((r) => r.every((v) => v === 0)));
});
test("sprint finishes at 40 lines", () => {
  const g = new Game("sprint");
  g.lines = 39;
  g.board[19] = [2, 2, 2, 2, 0, 0, 0, 0, 2, 2];
  g.piece = { id: 0, cells: [[1, 1, 1, 1]], x: 4, y: 19 };
  g.lock();
  assert.equal(g.lines, 40);
  assert.ok(g.over && g.won);
});
test("ultra ends at two minutes and freezes elapsed time", () => {
  const g = new Game("ultra");
  g.tick(120100);
  assert.ok(g.over && g.won);
  assert.equal(g.elapsed, 120000);
  g.tick(1000);
  assert.equal(g.elapsed, 120000);
});
test("blocked spawn ends a run", () => {
  const g = new Game("marathon");
  g.board[0].fill(1);
  g.spawn();
  assert.ok(g.over);
});
test("rotation at a wall stays in bounds", () => {
  const g = new Game("marathon");
  g.piece = { id: 0, cells: [[1], [1], [1], [1]], x: 9, y: 8 };
  assert.ok(g.rotate());
  assert.equal(g.collides(g.piece), false);
});
test("marathon accelerates, zen maintains fixed speed", () => {
  const g = new Game("marathon"),
    z = new Game("zen");
  const before = g.speed;
  g.lines = 30;
  z.lines = 30;
  assert.ok(g.speed < before);
  assert.equal(z.speed, 1000);
});

export type Mode = "marathon" | "sprint" | "ultra" | "zen";
export const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];
export type Piece = { id: number; cells: number[][]; x: number; y: number };
export class Game {
  board = Array.from({ length: 20 }, () => Array<number>(10).fill(0));
  queue: number[] = [];
  piece!: Piece;
  held: number | null = null;
  heldThisTurn = false;
  score = 0;
  lines = 0;
  elapsed = 0;
  over = false;
  won = false;
  combo = -1;
  constructor(
    public mode: Mode,
    private random = Math.random,
  ) {
    this.fillQueue();
    this.spawn();
  }
  get level() {
    return 1 + Math.floor(this.lines / 10);
  }
  get speed() {
    return this.mode === "zen"
      ? 1000
      : Math.max(65, 850 * Math.pow(0.8, this.level - 1));
  }
  fillQueue() {
    while (this.queue.length < 8) {
      const bag = [0, 1, 2, 3, 4, 5, 6];
      for (let i = 6; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      this.queue.push(...bag);
    }
  }
  spawn(id?: number) {
    this.fillQueue();
    const next = id ?? this.queue.shift()!;
    this.piece = {
      id: next,
      cells: SHAPES[next].map((r) => [...r]),
      x: 3,
      y: 0,
    };
    if (this.collides(this.piece)) this.over = true;
  }
  collides(p: Piece) {
    return p.cells.some((r, y) =>
      r.some(
        (v, x) =>
          v &&
          (p.x + x < 0 ||
            p.x + x >= 10 ||
            p.y + y >= 20 ||
            (p.y + y >= 0 && this.board[p.y + y][p.x + x] !== 0)),
      ),
    );
  }
  move(dx: number, dy = 0) {
    if (this.over) return false;
    const p = { ...this.piece, x: this.piece.x + dx, y: this.piece.y + dy };
    if (this.collides(p)) return false;
    this.piece = p;
    return true;
  }
  rotate(direction = 1) {
    if (this.over || this.piece.id === 1) return false;
    const a = this.piece.cells;
    const cells =
      direction === 1
        ? a[0].map((_, i) => a.map((r) => r[i]).reverse())
        : a[0].map((_, i) => a.map((r) => r[a[0].length - 1 - i]));
    for (const [dx, dy] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-2, 0],
      [2, 0],
      [-3, 0],
      [3, 0],
      [0, -1],
      [0, -2],
    ]) {
      const p = {
        ...this.piece,
        cells,
        x: this.piece.x + dx,
        y: this.piece.y + dy,
      };
      if (!this.collides(p)) {
        this.piece = p;
        return true;
      }
    }
    return false;
  }
  ghost() {
    const p = { ...this.piece };
    while (!this.collides({ ...p, y: p.y + 1 })) p.y++;
    return p;
  }
  hold() {
    if (this.heldThisTurn || this.over) return false;
    const id = this.piece.id;
    this.spawn(this.held ?? undefined);
    this.held = id;
    this.heldThisTurn = true;
    return true;
  }
  drop() {
    if (this.over) return 0;
    const g = this.ghost();
    this.score += (g.y - this.piece.y) * 2;
    this.piece = g;
    return this.lock();
  }
  lock() {
    if (this.over) return 0;
    this.piece.cells.forEach((r, y) =>
      r.forEach((v, x) => {
        if (v && y + this.piece.y >= 0)
          this.board[y + this.piece.y][x + this.piece.x] = this.piece.id + 1;
      }),
    );
    const remaining = this.board.filter((r) => r.some((v) => !v));
    const cleared = 20 - remaining.length;
    this.combo = cleared ? this.combo + 1 : -1;
    this.score +=
      ([0, 100, 300, 500, 800][cleared] + Math.max(0, this.combo) * 50) *
      this.level;
    this.lines += cleared;
    this.board = [
      ...Array.from({ length: cleared }, () => Array<number>(10).fill(0)),
      ...remaining,
    ];
    this.heldThisTurn = false;
    if (this.mode === "sprint" && this.lines >= 40) {
      this.over = true;
      this.won = true;
    } else this.spawn();
    return cleared;
  }
  tick(ms: number) {
    if (this.over) return;
    this.elapsed += ms;
    if (this.mode === "ultra" && this.elapsed >= 120000) {
      this.elapsed = 120000;
      this.over = true;
      this.won = true;
    }
  }
}

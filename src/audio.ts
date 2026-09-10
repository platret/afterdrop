export class Sound {
  context?: AudioContext;
  music = 0.35;
  effects = 0.6;
  timer?: number;
  step = 0;
  async unlock() {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
  }
  tone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
  ) {
    if (!this.context || volume === 0) return;
    const t = this.context.currentTime;
    const o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume * 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g);
    g.connect(this.context.destination);
    o.start();
    o.stop(t + duration);
  }
  fx(kind = "move") {
    this.tone(
      kind === "clear"
        ? 660
        : kind === "drop"
          ? 110
          : kind === "rotate"
            ? 330
            : 220,
      kind === "clear" ? 0.5 : 0.12,
      this.effects,
      "triangle",
    );
    if (kind === "clear")
      setTimeout(() => this.tone(880, 0.6, this.effects), 100);
  }
  start() {
    this.stop();
    const notes = [
      220, 0, 329.63, 440, 0, 261.63, 329.63, 0, 196, 0, 293.66, 392, 0, 246.94,
      293.66, 0,
    ];
    this.timer = window.setInterval(() => {
      const n = notes[this.step % notes.length];
      if (n) this.tone(n, 0.7, this.music, "sine");
      if (this.step % 4 === 0)
        this.tone(
          this.step % 16 < 8 ? 55 : 49,
          1.2,
          this.music * 0.8,
          "triangle",
        );
      this.step++;
    }, 240);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}

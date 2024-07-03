import { v4 } from "uuid";
export class Game {
  rolledNumbers: Array<number>;
  boards: Array<{
    id: string;
    layout: number[][];
  }>;

  constructor() {
    this.rolledNumbers = [];
    this.boards = [
      {
        id: v4(),
        layout: generateBoard(),
      },
    ];
  }

  roll() {
    let value: number;

    do {
      value = getNumInRange(1, 75);
    } while (this.getHasRolled(value));

    this.rolledNumbers.push(value);
  }

  private getHasRolled(num: number) {
    return new Set(this.rolledNumbers).has(num);
  }

  reset() {
    this.rolledNumbers = [];
    // this.boards = [];
  }

  generateBoardsForPlayerCount(playerCount: number) {
    const result: Game["boards"] = [];
    for (let i = 0; i < playerCount; i++) {
      let id: string;
      do {
        id = v4();
      } while (new Set(this.boards.map((b) => b.id)).has(id));
      result.push({
        id,
        layout: generateBoard(),
      });
    }
    this.boards = result;
  }
}

export const COL_ROWS = Array(5)
  .fill(null)
  .map((_, index) => index);

export const ranges: Record<number, Array<number>> = {
  0: [1, 15],
  1: [16, 30],
  2: [31, 45],
  3: [46, 60],
  4: [61, 75],
};

function generateBoard() {
  const result = [...COL_ROWS].map(() => [...COL_ROWS]);

  const currentValues = new Set();

  COL_ROWS.forEach((_, i) => {
    COL_ROWS.forEach((_, j) => {
      if (i in ranges) {
        const [min, max] = ranges[i];

        let value;

        do {
          value = getNumInRange(min, max);
        } while (currentValues.has(value));

        currentValues.add(value);
        result[i][j] = value;
      }
    });
  });

  return result;
}

function getNumInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

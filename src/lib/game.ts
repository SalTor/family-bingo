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

type GetIsWinningBoardArgs = {
  board: Array<Array<number>>;
  rolledNumbers: Game["rolledNumbers"];
};
export function getWinningCoordinates(args: GetIsWinningBoardArgs) {
  const { board, rolledNumbers } = args;

  return checkColumns() || checkRows() || checkDiagonals();

  function checkColumns() {
    const col_counts: Record<number, number> = {};
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const value = board[i][j];
        if (getHasRolled(value, rolledNumbers)) {
          col_counts[i] = (col_counts[i] || 0) + 1;
        } else {
          col_counts[i] = col_counts[i] || 0;
        }
      }
    }
    const winningColumn = Object.entries(col_counts).find(
      ([, v]) => v === board.length,
    );

    if (winningColumn) {
      return { column: parseInt(winningColumn[0]) };
    }

    return null;
  }

  function checkRows() {
    const row_counts: Record<number, number> = {};
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const value = board[j][i];
        if (getHasRolled(value, rolledNumbers)) {
          row_counts[i] = (row_counts[i] || 0) + 1;
        } else {
          row_counts[i] = row_counts[i] || 0;
        }
      }
    }
    const winningRow = Object.entries(row_counts).find(
      ([, v]) => v === board.length,
    );

    if (winningRow) {
      return { row: parseInt(winningRow[0]) };
    }

    return null;
  }

  function checkDiagonals() {
    let left_right_count = 0;

    for (let i = 0; i < board.length; i++) {
      const LRV = board[i][i];
      if (getHasRolled(LRV, rolledNumbers)) {
        left_right_count += 1;
      }
    }

    if (left_right_count === board.length) {
      return {
        diagonal: [
          [0, 0],
          [board.length - 1, board.length - 1],
        ],
      };
    }

    let right_left_count = 0;
    for (let i = 0; i < board.length; i++) {
      const RLV = board[board.length - 1 - i][i];
      if (getHasRolled(RLV, rolledNumbers)) {
        right_left_count += 1;
      }
    }

    if (right_left_count === board.length) {
      return {
        diagonal: [
          [board.length - 1, 0],
          [0, board.length - 1],
        ],
      };
    }
  }
}

function getHasRolled(value: number, rolledNumbers: Array<number>) {
  return new Set(rolledNumbers).has(value);
}

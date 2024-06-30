import { useEffect, useState } from "react";
import "./App.css";
import cn from "classnames";

class Game {
  rolledNumbers: Array<number>;

  constructor(game?: Game) {
    if (game) {
      this.rolledNumbers = game.rolledNumbers;
    } else {
      this.rolledNumbers = [];
    }
  }

  roll() {
    let value: number;

    do {
      value = getNumInRange(1, 75);
    } while (this.getHasRolled(value));

    this.rolledNumbers.push(value);

    console.info("rolled", { value, rolledSoFar: this.rolledNumbers });
  }

  getHasRolled(num: number) {
    return new Set(this.rolledNumbers).has(num);
  }
}

const game = new Game();

export default function App() {
  const [rolledNumbers, setRolledNumbers] = useState(game.rolledNumbers);

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Family Bingo!</h1>

      <button
        onClick={() => {
          game.roll();
          setRolledNumbers([...game.rolledNumbers]);
        }}
      >
        Roll a number!
      </button>

      <div className="flex gap-10">
        <GameBoard rolledNumbers={rolledNumbers} />

        <RolledNumbers values={rolledNumbers} />
      </div>
    </div>
  );
}

function RolledNumbers(props: { values: Game["rolledNumbers"] }) {
  return (
    <div>
      <h2>Rolled numbers</h2>
      {[...props.values].reverse().map((roll) => (
        <p key={roll}>
          {getValueLetter({ value: roll })}
          {roll}
        </p>
      ))}
    </div>
  );
}

const COL_ROWS = Array(5)
  .fill(null)
  .map((_, index) => index);

function getColumnLetter(args: { index: number | string }) {
  switch (args.index.toString()) {
    case "0":
      return "B";
    case "1":
      return "I";
    case "2":
      return "N";
    case "3":
      return "G";
    case "4":
      return "O";
    default:
      return null;
  }
}

const ranges: Record<number, Array<number>> = {
  0: [1, 15],
  1: [16, 30],
  2: [31, 45],
  3: [46, 60],
  4: [61, 75],
};

function getValueLetter(args: { value: number }) {
  const match = Object.entries(ranges).find(([, range]) => {
    const [min, max] = range;
    return args.value >= min && args.value <= max;
  });
  if (match) {
    return getColumnLetter({ index: match[0] });
  }
  return null;
}

function GameBoard(props: { rolledNumbers: Game["rolledNumbers"] }) {
  const [board] = useState(generateBoard());

  useEffect(() => {
    const isWinner = getIsWinningBoard({
      board,
      rolledNumbers: props.rolledNumbers,
    });
    if (isWinner) {
      console.info("winner");
    } else {
      console.info("not yet a winner");
    }
  }, [props.rolledNumbers, board]);

  return (
    <div className="flex">
      {COL_ROWS.map((column) => (
        <div
          key={`col-${column}`}
          className="flex flex-col border border-x-0 border-y-0 border-solid border-black"
        >
          <div className="w-10 h-10 flex justify-center items-center">
            {getColumnLetter({ index: column })}
          </div>
          {COL_ROWS.map((row) => {
            const value = board[column][row];
            const isActivated = getHasRolled(value, props.rolledNumbers);
            return (
              <div
                key={`cell-${row}`}
                className={cn(
                  "relative w-10 h-10 border-black border border-solid flex justify-center items-center",
                  {
                    "border-r-0": column !== COL_ROWS.length - 1,
                    "border-b-0": row !== COL_ROWS.length - 1,
                  },
                )}
              >
                {value}
                {isActivated && (
                  <div className="h-[90%] w-[90%] absolute rounded-[50%] bg-red-400/50" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getHasRolled(value: number, rolledNumbers: Array<number>) {
  return new Set(rolledNumbers).has(value);
}

function getNumInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

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

type GetIsWinningBoardArgs = {
  board: Array<Array<number>>;
  rolledNumbers: Game["rolledNumbers"];
};
function getIsWinningBoard(args: GetIsWinningBoardArgs) {
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
    return Object.values(col_counts).some((v) => v === board.length);
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
    return Object.values(row_counts).some((v) => v === board.length);
  }

  function checkDiagonals() {
    let left_right_count = 0;

    for (let i = 0; i < board.length; i++) {
      const LRV = board[i][i];
      if (getHasRolled(LRV, rolledNumbers)) {
        left_right_count += 1;
      }
    }

    let right_left_count = 0;
    for (let i = 0; i < board.length; i++) {
      const RLV = board[board.length - 1 - i][i];
      if (getHasRolled(RLV, rolledNumbers)) {
        right_left_count += 1;
      }
    }

    return (
      left_right_count === board.length || right_left_count === board.length
    );
  }
}

import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [game, setGame] = useState(new Game());

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Family Bingo!</h1>

      <button
        onClick={() => {
          game.roll();
          setGame(new Game(game));
        }}
      >
        Roll a number!
      </button>

      {/*<RolledNumbers game={game} />*/}

      <GameBoard game={game} />
    </div>
  );
}

export default App;

class Game {
  rolledNumbers: Set<number>;

  constructor(game?: Game) {
    if (game) {
      this.rolledNumbers = game.rolledNumbers;
    } else {
      this.rolledNumbers = new Set();
    }
  }

  roll() {
    let value: number;

    do {
      value = getNumInRange(1, 75);
    } while (this.rolledNumbers.has(value));

    this.rolledNumbers.add(value);

    console.info("rolled", { value, rolledSoFar: this.rolledNumbers });

    return value;
  }
}

const COL_ROWS = Array(5)
  .fill(null)
  .map((_, index) => index);

type GameBoardProps = {
  game: Game;
};
function GameBoard(props: GameBoardProps) {
  const [board] = useState(generateBoard());
  useEffect(() => {
    const isWinner = getIsWinningBoard({ game: props.game, board });
    if (isWinner) {
      console.info("winner");
    } else {
      console.info("not yet a winner");
    }
  }, [props.game, board]);

  return (
    <div className="flex gap-2">
      {COL_ROWS.map((column) => (
        <div key={`col-${column}`} className="flex flex-col gap-2">
          {COL_ROWS.map((row) => {
            const value = board[column][row];
            const isActivated = props.game.rolledNumbers.has(value)
              ? "bg-black"
              : "";
            return (
              <div
                key={`cell-${row}`}
                className={`w-10 h-10 border-black border border-solid flex justify-center items-center ${isActivated}`}
              >
                {value}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getNumInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generateBoard() {
  const result = [...COL_ROWS].map(() => [...COL_ROWS]);

  const currentValues = new Set();
  const ranges: Record<number, Array<number>> = {
    0: [1, 15],
    1: [16, 30],
    2: [31, 45],
    3: [46, 60],
    4: [61, 75],
  };

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
  game: Game;
  board: Array<Array<number>>;
};
function getIsWinningBoard(args: GetIsWinningBoardArgs) {
  return checkColumns() || checkRows() || checkDiagonals();

  function checkColumns() {
    const { board, game } = args;

    const col_counts: Record<number, number> = {};
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const value = board[i][j];
        if (game.rolledNumbers.has(value)) {
          col_counts[i] = (col_counts[i] || 0) + 1;
        } else {
          col_counts[i] = col_counts[i] || 0;
        }
      }
    }
    return Object.values(col_counts).some((v) => v === board.length);
  }

  function checkRows() {
    const { board, game } = args;

    const row_counts: Record<number, number> = {};
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const value = board[j][i];
        if (game.rolledNumbers.has(value)) {
          row_counts[i] = (row_counts[i] || 0) + 1;
        } else {
          row_counts[i] = row_counts[i] || 0;
        }
      }
    }
    return Object.values(row_counts).some((v) => v === board.length);
  }

  function checkDiagonals() {
    const { board, game } = args;

    let left_right_count = 0;

    for (let i = 0; i < board.length; i++) {
      const LRV = board[i][i];
      if (game.rolledNumbers.has(LRV)) {
        left_right_count += 1;
      }
    }

    let right_left_count = 0;
    for (let i = 0; i < board.length; i++) {
      const RLV = board[board.length - 1 - i][i];
      if (game.rolledNumbers.has(RLV)) {
        right_left_count += 1;
      }
    }

    return (
      left_right_count === board.length || right_left_count === board.length
    );
  }
}

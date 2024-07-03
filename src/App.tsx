import { useMemo, useState } from "react";
import "./App.css";
import cn from "classnames";
import { COL_ROWS, Game, ranges } from "./lib/game";

const game = new Game();

export default function App() {
  const [rolledNumbers, setRolledNumbers] = useState(game.rolledNumbers);
  const numberOfPlayers = 2;
  const boards = useMemo(() => {
    game.generateBoardsForPlayerCount(numberOfPlayers);
    return game.boards;
  }, [numberOfPlayers]);

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Family Bingo!</h1>

      <div className="flex gap-2">
        <button
          onClick={() => {
            game.roll();
            setRolledNumbers([...game.rolledNumbers]);
          }}
        >
          Roll a number!
        </button>
        <button
          onClick={() => {
            game.reset();
            setRolledNumbers([...game.rolledNumbers]);
          }}
        >
          Reset game
        </button>
      </div>

      <div className="flex gap-10">
        <div className="flex flex-col gap-5">
          {boards.map((board) => (
            <GameBoard
              key={board.id}
              board={board.layout}
              rolledNumbers={rolledNumbers}
            />
          ))}
        </div>

        <RolledNumbers values={rolledNumbers} />
      </div>
    </div>
  );
}

function RolledNumbers(props: { values: Game["rolledNumbers"] }) {
  return (
    <div>
      <h2>Rolled numbers</h2>
      <div className="relative max-h-[200px] overflow-y-scroll overflow-x-visible">
        {[...props.values].reverse().map((roll, index) => (
          <p
            key={roll}
            className={cn(index === 0 && "rounded-md bg-blue-200 font-bold")}
          >
            {getValueLetter({ value: roll })}
            {roll}
          </p>
        ))}
      </div>
    </div>
  );
}

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

function GameBoard(props: {
  board: number[][];
  rolledNumbers: Game["rolledNumbers"];
}) {
  const winningCoordinates = getWinningCoordinates(props);

  return (
    <div>
      <div className="flex relative" id="board">
        {COL_ROWS.map((column) => (
          <div
            key={`col-${column}`}
            data-column
            className="flex flex-col border border-x-0 border-y-0 border-solid border-black"
          >
            <div className="w-10 h-10 flex justify-center items-center">
              {getColumnLetter({ index: column })}
            </div>

            {COL_ROWS.map((row) => {
              const value = props.board[column][row];
              const isActivated = getHasRolled(value, props.rolledNumbers);
              return (
                <div
                  key={`cell-${row}`}
                  data-cell
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

        {winningCoordinates && (
          <svg className="h-full w-full absolute inset-0">
            <line stroke="black" {...translateCoordinate(winningCoordinates)} />
          </svg>
        )}
      </div>
    </div>
  );
}

function translateCoordinate(
  winningCoordinates:
    | Readonly<{ row: number }>
    | Readonly<{ column: number }>
    | Readonly<{ diagonal: number[][] }>,
) {
  const columns = Array.from(document.querySelectorAll("[data-column]"));

  if ("row" in winningCoordinates) {
    // handle row
    const cells: Array<Element> = [];
    columns.forEach((_) => {
      Array.from(_.querySelectorAll("[data-cell]")).forEach((__, cellIndex) => {
        if (cellIndex === winningCoordinates.row) {
          cells.push(__);
        }
      });
    });
    const start = cells[0] as HTMLElement;
    const end = cells[cells.length - 1] as HTMLElement;
    return {
      x1: start.offsetLeft,
      y1: start.offsetTop + 20,
      x2: end.offsetLeft + 40,
      y2: end.offsetTop + 20,
    };
  }

  if ("column" in winningCoordinates) {
    // handle column
    const col = columns[winningCoordinates.column];
    console.log(col);
    const children = Array.from(col.children);
    const start = children[0] as HTMLElement;
    const end = children[children.length - 1] as HTMLElement;
    return {
      x1: start.offsetLeft + 20,
      y1: start.offsetTop + 40,
      x2: end.offsetLeft + 20,
      y2: end.offsetTop + 40,
    };
  }

  if ("diagonal" in winningCoordinates) {
    // handle diagonals
    const [[start_x, start_y], [end_x, end_y]] = winningCoordinates.diagonal;
    const start = Array.from(columns[start_x].children)[start_y] as HTMLElement;
    const end = Array.from(columns[end_x].children)[end_y] as HTMLElement;
    if (start_x > end_x) {
      return {
        x1: start.offsetLeft + 40,
        y1: start.offsetTop + 40,
        x2: end.offsetLeft,
        y2: end.offsetTop + 80,
      };
    }
    return {
      x1: start.offsetLeft,
      y1: start.offsetTop + 40,
      x2: end.offsetLeft + 40,
      y2: end.offsetTop + 80,
    };
  }

  return {};
}

function getHasRolled(value: number, rolledNumbers: Array<number>) {
  return new Set(rolledNumbers).has(value);
}

type GetIsWinningBoardArgs = {
  board: Array<Array<number>>;
  rolledNumbers: Game["rolledNumbers"];
};
function getWinningCoordinates(args: GetIsWinningBoardArgs) {
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

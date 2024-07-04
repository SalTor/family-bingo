import "./App.css";
import cn from "classnames";
import { IGameContext, useGame, Board } from "./lib/GameContext";
import { useEffect } from "react";

export default function App() {
  const game = useGame();

  useEffect(() => {
    game.makeBoards(2);
    return () => {};
  }, []);

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Family Bingo!</h1>

      <div className="flex gap-2">
        <button onClick={() => game.roll()}>Roll a number!</button>

        {game.rolledNumbers.length > 0 && (
          <button onClick={() => game.resetGame()}>Reset game</button>
        )}
      </div>

      <div className="flex gap-10">
        <div className="flex flex-col gap-5">
          {game.boards.map((board) => (
            <GameBoard key={board.id} board={board} />
          ))}
        </div>

        <RolledNumbers />
      </div>
    </div>
  );
}

function RolledNumbers() {
  const game = useGame();

  if (game.rolledNumbers.length === 0) {
    return null;
  }

  return (
    <div>
      <h2>Rolled numbers</h2>

      <div className="relative max-h-[200px] overflow-y-scroll overflow-x-visible">
        {[...game.rolledNumbers].reverse().map((roll, index) => {
          const displayValue = `${roll.column}${roll.value}`;
          return (
            <p
              key={displayValue}
              className={cn(index === 0 && "rounded-md bg-blue-200 font-bold")}
            >
              {displayValue}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function GameBoard(props: { board: Board }) {
  const game = useGame();

  const columns = props.board.layout;

  return (
    <div>
      <div className="flex relative" id="board">
        {columns.map(({ column, values }, columnIndex) => {
          const columnLetter = column;

          return (
            <div
              key={`col-${columnLetter}`}
              data-column
              className="flex flex-col border border-x-0 border-y-0 border-solid border-black"
            >
              <div className="w-10 h-10 flex justify-center items-center">
                {columnLetter}
              </div>

              {values.map((value, cellIndex) => {
                const isActivated = game.getHasRolled({ column, value });
                return (
                  <div
                    key={`cell-${value}`}
                    data-cell
                    className={cn(
                      "relative w-10 h-10 border-black border border-solid flex justify-center items-center",
                      {
                        "border-r-0": columnIndex !== columns.length - 1,
                        "border-b-0": cellIndex !== values.length - 1,
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
          );
        })}
      </div>
    </div>
  );
}

type GetIsWinningBoardArgs = {
  board: Board;
  rolledNumbers: IGameContext["rolledNumbers"];
};
export function getWinningCoordinates(args: GetIsWinningBoardArgs) {
  const game = useGame();
  const { board } = args;

  return checkColumns() || checkRows() || checkDiagonals();

  function checkColumns() {
    const col_counts: Record<number, number> = {};
    const columns = board.layout;
    for (let i = 0; i < columns.length; i++) {
      const { column, values } = columns[i];
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        if (game.getHasRolled({ column, value })) {
          col_counts[i] = (col_counts[i] || 0) + 1;
        } else {
          col_counts[i] = col_counts[i] || 0;
        }
      }
    }
    const winningColumn = Object.entries(col_counts).find(
      ([, v]) => v === board.layout.length,
    );

    if (winningColumn) {
      return { column: parseInt(winningColumn[0]) };
    }

    return null;
  }

  function checkRows() {
    const row_counts: Record<number, number> = {};

    const columns = board.layout;
    for (let i = 0; i < columns.length; i++) {
      const { column, values } = columns[i];
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        if (game.getHasRolled({ column, value })) {
          row_counts[i] = (row_counts[i] || 0) + 1;
        } else {
          row_counts[i] = row_counts[i] || 0;
        }
      }
    }
    const winningRow = Object.entries(row_counts).find(
      ([, v]) => v === board.layout.length,
    );

    if (winningRow) {
      return { row: parseInt(winningRow[0]) };
    }

    return null;
  }

  function checkDiagonals() {
    let left_right_count = 0;

    for (let i = 0; i < board.layout.length; i++) {
      const { column, values } = board.layout[i];
      const LRV = values[i];
      if (game.getHasRolled({ column, value: LRV })) {
        left_right_count += 1;
      }
    }

    if (left_right_count === board.layout.length) {
      return {
        diagonal: [
          [0, 0],
          [board.layout.length - 1, board.layout.length - 1],
        ],
      };
    }

    let right_left_count = 0;
    for (let i = 0; i < board.layout.length; i++) {
      const { column, values } = board.layout[board.layout.length - 1 - i];
      const RLV = values[i];
      if (game.getHasRolled({ column, value: RLV })) {
        right_left_count += 1;
      }
    }

    if (right_left_count === board.layout.length) {
      return {
        diagonal: [
          [board.layout.length - 1, 0],
          [0, board.layout.length - 1],
        ],
      };
    }
  }
}

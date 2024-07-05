import "./App.css";
import cn from "classnames";
import { useGame, Board } from "./lib/GameContext";
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
        <button onClick={() => game.roll()} disabled={game.hasWinningBoard}>
          Roll a number!
        </button>

        {game.rolledNumbers.size > 0 && (
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

  if (game.rolledNumbers.size === 0) {
    return null;
  }

  return (
    <div>
      <h2>Rolled numbers</h2>

      <div className="relative max-h-[200px] overflow-y-scroll overflow-x-visible">
        {[...game.rolledNumbers].reverse().map((roll, index) => {
          return (
            <p
              key={roll}
              className={cn(index === 0 && "rounded-md bg-blue-200 font-bold")}
            >
              {roll}
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
                const isActivated = game.getHasRolled(value);
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
                    {value.slice(1)}
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

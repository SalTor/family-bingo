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
    console.info("GAME", props.game);
  }, [props.game]);

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

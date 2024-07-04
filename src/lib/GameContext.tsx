import { createContext, useContext, useState } from "react";
import { Board } from "./game";
import { v4 } from "uuid";

const COL_ROWS = Array(5)
  .fill(null)
  .map((_, index) => index);

const ranges: Record<number, Array<number>> = {
  0: [1, 15],
  1: [16, 30],
  2: [31, 45],
  3: [46, 60],
  4: [61, 75],
};

const GameContext = createContext<{
  boards: Array<Board>;
  makeBoards: (_: number) => unknown;
  rolledNumbers: Set<number>;
  roll: (_: number) => void;
  resetGame: () => void;
}>({
  boards: [],
  makeBoards: (_: number) => {},
  rolledNumbers: new Set(),
  roll: (_: number) => {},
  resetGame: () => {},
});

export function GameProvider(props: { children: React.ReactNode }) {
  const [boards, setBoards] = useState([
    {
      id: "1",
      layout: generateBoard(),
    },
    {
      id: "2",
      layout: generateBoard(),
    },
  ]);

  function makeBoards(howMany: number) {
    const result: Array<Board> = [];

    for (let i = 0; i < howMany; i++) {
      let id: string;

      do {
        id = v4();
      } while (getHasBoardId(id));

      result.push({
        id,
        layout: generateBoard(),
      });
    }

    setBoards(result);
  }

  function getHasBoardId(id: string) {
    return new Set(boards.map((b) => b.id)).has(id);
  }

  const [rolledNumbers, setRolledNumbers] = useState(new Set<number>());

  function roll() {
    let value: number;

    do {
      value = getNumInRange(1, 75);
    } while (getHasRolled(value));

    setRolledNumbers(rolledNumbers.add(value));
  }

  function getHasRolled(num: number) {
    return rolledNumbers.has(num);
  }

  function resetGame() {
    setBoards([]);
    setRolledNumbers(new Set());
  }

  return (
    <GameContext.Provider
      value={{ boards, makeBoards, rolledNumbers, roll, resetGame }}
    >
      {props.children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);

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

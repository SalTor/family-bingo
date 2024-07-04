import { createContext, useContext, useState } from "react";
import { v4 } from "uuid";

export type Board = {
  id: string;
  layout: number[][];
};

export const ranges: Record<number, Array<number>> = {
  0: [1, 15],
  1: [16, 30],
  2: [31, 45],
  3: [46, 60],
  4: [61, 75],
};

export type IGameContext = {
  boards: Array<Board>;
  makeBoards: (_: number) => unknown;
  rolledNumbers: Array<number>;
  roll: () => void;
  resetGame: () => void;
};

const GameContext = createContext<IGameContext>({
  boards: [],
  makeBoards: (_: number) => {},
  rolledNumbers: [],
  roll: () => {},
  resetGame: () => {},
});

function generateDefaultBoards() {
  return [
    {
      id: "1",
      layout: generateBoard(),
    },
    {
      id: "2",
      layout: generateBoard(),
    },
  ];
}

export function GameProvider(props: { children: React.ReactNode }) {
  const [boards, setBoards] = useState(generateDefaultBoards());

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

    setRolledNumbers(new Set(rolledNumbers).add(value));
  }

  function getHasRolled(num: number) {
    return rolledNumbers.has(num);
  }

  function resetGame() {
    setBoards(generateDefaultBoards());
    setRolledNumbers(new Set());
  }

  return (
    <GameContext.Provider
      value={{
        boards,
        makeBoards,
        rolledNumbers: Array.from(rolledNumbers),
        roll,
        resetGame,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);

function generateBoard() {
  const result: number[][] = [];
  const currentValues = new Set<number>();

  const size = 5;

  for (let columnIndex = 0; columnIndex < size; columnIndex++) {
    result.push(buildColumn(columnIndex, size, currentValues));
  }

  return result;
}

function buildColumn(
  columnIndex: number,
  size: number,
  currentValues: Set<number>,
) {
  const result: number[] = [];

  const [min, max] = ranges[columnIndex];

  for (let j = 0; j < size; j++) {
    let value;

    do {
      value = getNumInRange(min, max);
    } while (currentValues.has(value));

    currentValues.add(value);

    result.push(value);
  }

  return result;
}

function getNumInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

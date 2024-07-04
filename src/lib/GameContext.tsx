import { createContext, useContext, useState } from "react";
import { v4 } from "uuid";

export type Board = {
  id: string;
  layout: Array<{ column: string; values: number[]; range: [number, number] }>;
};

const rangeByLetter: Record<string, [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};
export const rangeToLetter: Array<[[number, number], string]> = Object.entries(
  rangeByLetter,
).map(([letter, range]) => [range, letter]);

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

export const useGame = () => useContext(GameContext);

export function GameProvider(props: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<Array<Board>>([]);
  const [requestedBoards, setRequestedBoards] = useState(0);

  function makeBoards(howMany: number) {
    setRequestedBoards(howMany);

    const result: Array<Board> = [];

    for (let i = 0; i < howMany; i++) {
      let id: string;

      do {
        id = v4();
      } while (getHasBoardId(id));

      result.push({
        id,
        layout: generateBoardLayout(),
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
    makeBoards(requestedBoards);
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

  function generateBoardLayout(): Board["layout"] {
    const currentValues = new Set<number>();

    return ["B", "I", "N", "G", "O"].map((c) => buildColumn(rangeFor(c)));

    function rangeFor(letter: string) {
      return { column: letter, range: rangeByLetter[letter] };
    }

    function buildColumn(args: {
      column: string;
      range: [min: number, max: number];
    }) {
      const [min, max] = args.range;

      return {
        column: args.column,
        range: args.range,
        values: [getValue(), getValue(), getValue(), getValue(), getValue()],
      };

      function getValue() {
        let value;

        do {
          value = getNumInRange(min, max);
        } while (currentValues.has(value));

        currentValues.add(value);

        return value;
      }
    }
  }

  function getNumInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

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

export type Roll = {
  column: string;
  value: number;
};
export type IGameContext = {
  boards: Array<Board>;
  makeBoards: (_: number) => void;
  rolledNumbers: Array<Roll>;
  getHasRolled: (_: Roll) => boolean;
  roll: () => void;
  resetGame: () => void;
};

const GameContext = createContext<IGameContext>({
  boards: [],
  makeBoards: (_: number) => {},
  rolledNumbers: [],
  getHasRolled: (_: Roll) => true,
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

  const [rolledNumbers, setRolledNumbers] = useState(new Set<Roll>());

  function roll() {
    const cols = ["B", "I", "N", "G", "O"] as const;

    const column = cols[getNumInRange(0, cols.length - 1)];

    const [min, max] = rangeByLetter[column];

    let value: number;

    do {
      value = getNumInRange(min, max);
    } while (getHasRolled({ column, value }));

    setRolledNumbers(new Set(rolledNumbers).add({ column, value }));
  }

  function getHasRolled(roll: Roll) {
    return Array.from(rolledNumbers).some(
      (r) => r.column === roll.column && r.value === roll.value,
    );
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
        getHasRolled,
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

import { createContext, useContext, useMemo, useState } from "react";
import { v4 } from "uuid";
import { produce, enableMapSet } from "immer";

enableMapSet();

export type Board = {
  id: string;
  layout: Array<{ column: string; values: string[] }>;
};

const columnRanges: [string, [number, number]][] = [
  ["B", [1, 15]],
  ["I", [16, 30]],
  ["N", [31, 45]],
  ["G", [46, 60]],
  ["O", [61, 75]],
];
const potentialRolls = columnRanges.flatMap(([column, [min, max]]) => {
  const result = [];

  for (let value = min; value <= max; value++) {
    result.push(`${column}${value}`);
  }

  return result;
});

export type IGameContext = {
  boards: Array<Board>;
  hasWinningBoard: boolean;
  makeBoards: (_: number) => void;
  rolledNumbers: Set<string>;
  getHasRolled: (_: string) => boolean;
  roll: () => void;
  resetGame: () => void;
};

const GameContext = createContext<IGameContext>({
  boards: [],
  hasWinningBoard: false,
  makeBoards: (_: number) => {},
  rolledNumbers: new Set(),
  getHasRolled: (_: string) => true,
  roll: () => {},
  resetGame: () => {},
});

export const useGame = () => useContext(GameContext);

export function GameProvider(props: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<Array<Board>>([]);
  const [requestedBoards, setRequestedBoards] = useState(0);
  const [rolledNumbers, setRolledNumbers] = useState(new Set<string>());
  const [availableRolls, setAvailableRolls] = useState(potentialRolls);

  const hasWinningBoard = useMemo(() => {
    return boards.some(getIsWinningBoard);
  }, [boards, rolledNumbers]);

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

  function getIsWinningBoard(board: Board) {
    const { layout } = board;

    return hasWinningColumn() || hasWinningRow() || hasWinningDiagonal();

    function hasWinningColumn() {
      return layout.some(({ values }) => {
        return values.every(getHasRolled);
      });
    }

    function hasWinningRow() {
      for (let i = 0; i < layout.length - 1; i++) {
        if (layout.every((c) => getHasRolled(c.values[i]))) {
          return true;
        }
      }
      return false;
    }

    function hasWinningDiagonal() {
      const top_left_to_bottom_right = [
        layout[0].values[0],
        layout[1].values[1],
        layout[2].values[2],
        layout[3].values[3],
        layout[4].values[4],
      ].every(getHasRolled);

      const height = layout.length - 1;
      const bottom_left_to_top_right = [
        layout[0].values[height],
        layout[1].values[height - 1],
        layout[2].values[height - 2],
        layout[3].values[height - 3],
        layout[4].values[height - 4],
      ].every(getHasRolled);

      return top_left_to_bottom_right || bottom_left_to_top_right;
    }
  }

  function roll() {
    if (availableRolls.length === 0) {
      return null; // game has been maxed out
    }

    let rollIndex: number;
    do {
      rollIndex = getNumInRange(0, availableRolls.length - 1);
    } while (getHasRolled(availableRolls[rollIndex]));

    setAvailableRolls(
      produce(availableRolls, (draft) => {
        draft.splice(rollIndex, 1);
      }),
    );

    setRolledNumbers(
      produce(rolledNumbers, (draft) => {
        draft.add(availableRolls[rollIndex]);
      }),
    );
  }

  function getHasRolled(roll: string) {
    return rolledNumbers.has(roll);
  }

  function resetGame() {
    makeBoards(requestedBoards);
    setRolledNumbers(new Set());
  }

  return (
    <GameContext.Provider
      value={{
        boards,
        hasWinningBoard,
        makeBoards,
        rolledNumbers,
        getHasRolled,
        roll,
        resetGame,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );

  function generateBoardLayout(): Board["layout"] {
    const optionsByColumn = potentialRolls.reduce(
      (b, option) => {
        const colName = option.slice(0, 1);
        if (Array.isArray(b[colName])) {
          b[colName].push(option);
        } else {
          b[colName] = [option];
        }
        return b;
      },
      {} as Record<string, string[]>,
    );

    type BoardColl = { column: string; values: string[] };
    const acc: Array<BoardColl> = [];
    for (const [key, [...column]] of Object.entries(optionsByColumn)) {
      const result: BoardColl = {
        column: key,
        values: [],
      };

      while (result.values.length < 5) {
        const index = getNumInRange(0, column.length - 1);
        const [val] = column.splice(index, index + 1);
        result.values.push(val);
      }

      acc.push(result);
    }

    return acc;
  }

  function getNumInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

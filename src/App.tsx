import React, { useCallback, useEffect, useState } from 'react';

import { evaluateGameTree, newRandDeck, newStack, Terminus } from './solitaire/evaluate';
import { Playfield, Card, ranks } from './solitaire/cards';
import { StackViewer } from './Viewer';

const cardMap = {
  h: 0,
  d: 1,
  c: 2,
  s: 3,

  G: 0,
  P: 1,
  S: 2,
  W: 3,

  m: 4,
  M: 4,
  a: 4,
  A: 4,
} as const;

function buildStateFromInput(input: string): Playfield {
  const field = new Playfield();
  const rowLength = field.field.length;
  function parseCard(c: string) {
    const pre = c.slice(0, c.length - 1);
    const h = c.slice(c.length-1);

    let suit = cardMap[h as keyof typeof cardMap];
    if (suit === undefined) {
      throw new TypeError(`Bad card: "${c}", "${h}" is not a suit`);
    }

    let rank;
    if (suit === 4) {
      rank = Number.parseInt(pre);
    } else {
      rank = ranks.indexOf(pre);
    }
    if (!isFinite(rank) || rank === -1) {
      throw new TypeError(`Bad card: "${c}", "${pre}" is not a rank`);
    }
    return new Card(cardMap[h as keyof typeof cardMap], rank);
  }

  const [home, arcana, ...rows] = input.split('\n');
  arcana.split(' ').forEach((num) => {
    if (num) {
      const rank = Number.parseInt(num);
      if (!isFinite(rank)) {
        throw new TypeError(`${num} is not an Arcana number`);
      }
      field.arcana[rank] = new Card(4, rank);
    }
  });
  home.split(' ').forEach((cardString) => {
    const card = parseCard(cardString);
    if (card.suit >= 4) {
      throw new TypeError(`${card} can't be Arcana in the Home Row`)
    }
    field.homes[card.suit as 0] = [card];
  })
  rows.map((row) => {
    const ic = row.split(' ');
    if (ic.length > rowLength) {
      throw new TypeError(`${ic.length} is too many cards in row: ${row}`);
    }
    return ic.map((str) => {
      if (str === ',') return undefined;
      return parseCard(str)
    });
  }).forEach((row, i) => {
    row.forEach((card, j) => {
      if (card) {
        field.field[j][i] = card;
      }
    })
  });

  return field;
}

function useSolver({
  initialState,
  interval = 10,
  fastStep = 100,
}: {
  initialState: Playfield;
  interval?: number;
  fastStep?: number;
}) {
  const [stack, setStack] = useState<Terminus>();
  useEffect(() => {
    let result: Terminus = newStack() as Terminus;
    let self: number;

    const timeStep = () => {
      for (let i = 0; i < fastStep; i++) {
        if (result === 'lose' || 'win' in result) {
          break;
        }
        result = evaluateGameTree(initialState, result);
      }

      setStack(result);
      if (result === 'lose' || 'win' in result) {
        clearInterval(self);
      }
    }

    self = setInterval(timeStep, interval);

    return () => { clearInterval(self); };
  }, [initialState, interval, fastStep]);

  return [stack, () => setStack(newStack())] as const
}

export const PuzzleSolver: React.FC<{initialState: Playfield}> = ({initialState}) => {
  const [stack] = useSolver({initialState});

  if (!stack) return null;

  if (stack === 'lose') {
    return <>
      <h1>Lose!</h1>
      <StackViewer initialCondition={initialState} stack={newStack()} />
    </>
  }

  if ('win' in stack) {
    return <>
      <h1>Solved!</h1>
      <StackViewer initialCondition={initialState} stack={stack.win} />
    </>
  }

  return <StackViewer initialCondition={initialState} stack={stack}/>
}

export const RandomSolver: React.FC = () => {
  const [initialState, setInitialState] = useState(new Playfield(newRandDeck()));
  const [stack, stackReset] = useSolver({initialState});
  const reset = useCallback(() => {
    stackReset();
    setInitialState(new Playfield(newRandDeck()));
  }, []);

  useEffect(() => {
    if (stack === 'lose' || !!stack && 'win' in stack) {
      let t = setTimeout(reset, 10000);
      return () => clearTimeout(t);
    }
  }, [stack])

  if (!stack) {
    return <></>;
  }

  if (stack === 'lose') {
    return <>
      <h1>Lose!</h1>
      <StackViewer initialCondition={initialState} stack={newStack()} />
    </>
  }

  if ('win' in stack) {
    return <StackViewer initialCondition={initialState} stack={stack.win} />
  }

  return <StackViewer initialCondition={initialState} stack={stack} />
}

export const App: React.FC = () => {
  const [solver, setSolver] = useState(false);
  const [input, setInput] = useState(`Ah Ad Ac As

11m 10s Qc Kd 0m , 15m 3c 6s 3s 8c
6h 9s 2c 9d 10m , Js Kh 19m 1m 17m
2d 8m Qh Qs 12m , Jh 2h 20m Qd 4h
13m 6d 14m 5h 8h , 6m Jd 7m 3h 10d
10c 2s 7s 4m 7h , 7c Ks 4d 9m 2m
8d 21m 6c 18m Kc , 4s Jc 8s 7d 5m
5c 9h 5d 9c 4c , 3m 3d 10h 5s 16m`);
  const [singleSolve, setSingleSolve] = useState(false);
  let error = '';
  if (solver) {
    return <RandomSolver/>
  }
  if (singleSolve) {
    try {
      const initialState = buildStateFromInput(input);
      return <PuzzleSolver initialState={initialState}/>
    } catch (e) {
      error = 'Invalid input: ' + e;
      setSingleSolve(false);
    }
  }

  let board: React.ReactNode = null;
  try {
    const initialState = buildStateFromInput(input);
    board = <StackViewer initialCondition={initialState} stack={newStack()}/>
  } catch (e) {
    error = 'Invalid input: ' + e;
  }

  return <>
    <main className='p-2'>
      <h1 className='text-2xl'>Directions.</h1>
      <p className='max-w-prose'>
        This is a solver for Fortune Solitaire. You can run me in
        {' '}<button className='px-1' onClick={() => setSolver(true)}>Screensaver Mode</button>{' '}
        which just solves puzzles randomly (and is kind of fun to watch), or you can input a board state in the below box and click the "solve this" button.
        The solver will then attempt to solve your board state.
      </p>
      <br/>
      <p className='max-w-prose'>
        The solver displays its progress as it solves. The board should be self-explanatory; the moves that the solver is exploring are displayed at the bottom.
        If you click on a move, you can freeze the board at that state. Clicking on the same move again clears the freeze.
      </p>
      <br/>
      <p className='max-w-prose'>Notes on inputting boards:
        <ol className='list-decimal ml-8'>
          <li>The first row in the input is the home cards, and should always have at least the Aces.</li>
          <li>The second row is any Arcana cards in the home.</li>
          <li>All subsequent rows are the card field.</li>
          <li>To input a blank in a row, use a single comma (",") character instead of a card.</li>
          <li>The board you've input appears in the bottom.</li>
          <li>If you input a nonsense board, the solver <em>will</em> get stuck. Input validation doesn't check if cards are missing.</li>
        </ol>
      </p>
      <br/>
      <textarea className='w-96' value={input} onChange={(e) => {setInput(e.target.value)}}/><br/>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button onClick={() => setSingleSolve(true)}>Solve This^</button>
      <br/>
      <br/>
      {board}
    </main>
  </>
}

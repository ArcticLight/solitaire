import { allPossibleMoves, Card, Playfield, ranks } from "./cards";
import { bugger } from "../whoops/bugger";

export type StackFrame = number
export type Stack = StackFrame[]

export function NaiveBuildPlayfieldFromStack(initialCondition: Playfield, stack: Stack): Playfield {
  const history = stack.slice(0, -1);
  const myPosition = initialCondition.clone();
  history.forEach(move => {
    myPosition.performMove(allPossibleMoves[move]);
  });
  return myPosition;
}

function evaluateResume(initialCondition: Playfield, stack: Stack) {
  const history = stack.slice(0,-1);
  const nextProposedIndex = stack[stack.length-1];
  const myHistory = initialCondition.clone();
  const historicalStates = new Set<string>();
  historicalStates.add(myHistory.toString())
  history.forEach(move => {
    myHistory.performMove(allPossibleMoves[move]);
    historicalStates.add(myHistory.canonicalField());
  });

  return {
    history,
    nextProposedIndex,
    myHistory,
    historicalStates,
  }
}

function newStackFrame(): StackFrame {
  return 0;
}

export function stackFrameToString(s: StackFrame): string {
  return allPossibleMoves[s].join('→')
}

export function newStack(): Stack {
  return [newStackFrame()];
}

export function newStaticDeck(): Card[] {
  return ([0,1,2,3] as const).flatMap((s) => ranks.map((_, r) => new Card(s, r)))
  .concat(new Array(22).fill(undefined).map((_, i) => new Card(4, i)))
}

export function newRandDeck(seed?: number): Card[] {
  // const rand = makeRand(seed);
  return newStaticDeck().sort(() => Math.random() - 0.5); // rand() - 0.5);
}

export type Terminus = Stack
  | { win: Stack }
  | 'lose';

export function evaluateGameTree(initialCondition: Playfield, stack: Stack): Terminus {
  const {
    history,
    nextProposedIndex,
    myHistory,
    historicalStates,
  } = evaluateResume(initialCondition, stack);

  if (myHistory.isMoveValid(allPossibleMoves[nextProposedIndex])) {
    // Can perform move that is on the stack:
    const myStep = myHistory.clone().performMove(allPossibleMoves[nextProposedIndex]);

    // Check that we can perform this move on the stack AND we have
    // not seen this board state before:
    if (!historicalStates.has(myStep.canonicalField())) {
      // We done?
      if (myStep.isGameCompleted()) {
        return {win: stack};
      }

      // Not done, descend tree:
      return [...stack, newStackFrame()];
    }
  }

  // Cannot perform move that is on the stack.
  // Still need to find next move.

  if (nextProposedIndex < allPossibleMoves.length - 1) {
    // Simple case: Next proposed move is not the end of the possible moves list.
    return [...history, nextProposedIndex + 1];
  }

  function historyPrune(history: number[]) {
    const lastEndL = history.lastIndexOf(allPossibleMoves.length - 1);
    if (lastEndL === -1) {
      return history;
    }
    return history.slice(0, lastEndL);
  }
  // Not-so-simple case: Back up the stack
  const prunedHistory = historyPrune(history);
  if (prunedHistory.length === 0) {
    return 'lose';
  }
  return [...prunedHistory.slice(0, -1), prunedHistory[prunedHistory.length - 1]+1];
}

bugger({evaluator: {
  evaluateGameTree,
  evaluateResume,
  newStack,
  newStackFrame,
  newStaticDeck,
  newRandDeck,
  NaiveBuildPlayfieldFromStack,
}});

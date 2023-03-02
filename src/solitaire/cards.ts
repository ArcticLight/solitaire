import { bugger } from "../whoops/bugger";

const tryFromOrdering = ['stow', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const tryToOrdering = ['goal', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'stow'] as const;
export type MoveFrom = typeof tryFromOrdering[number];
export type MoveTo = typeof tryToOrdering[number];
export type Move = [MoveFrom, MoveTo];
export const allPossibleMoves: Move[] =
  tryToOrdering.flatMap((to) => (
      tryFromOrdering.map<Move>((from) => [from, to])
  )
);

function findLastIndex<T = any>(array: T[], predicate: (x: T, i?: number) => boolean): number {
  for(let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i)) return i;
  }
  return -1;
}

export type Suit = 0|1|2|3|4;
export const suits = ['♥', '♦', '♣', '♠', '⟡'];
export const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class Card {
  suit: Suit;
  rank: number;

  constructor(suit: Suit, rank: number) {
    this.suit = suit;
    this.rank = rank;
  }

  toString() {
    const rankFrag = this.suit === 4 ? this.rank.toString(10) : `${ranks[this.rank]}`;
    return `[${rankFrag.padStart(2, ' ')}${suits[this.suit]}]`;
  }
}

export class Playfield {
  arcana: Card[];
  homes: [hearts: Card[], diamonds: Card[], clubs: Card[], spades: Card[]];
  stow?: Card;
  field: Card[][];

  constructor(deck?: Card[]) {
    this.arcana = new Array(22).fill(undefined);
    this.homes = [[],[],[],[]];
    this.stow = undefined;
    this.field = new Array(11).fill(undefined).map(()=>[])
    if (deck) {
      let put = -1;
      deck.forEach((card) => {
        if (card.rank === 0 && card.suit < 4) {
          this.homes[card.suit as any].push(card);
          return;
        }
        put += (put % 11 === 4) ? 2 : 1;
        this.field[put%11].push(card)
      });
    }
  }

  performMove([from, to]: Move): this {
    const putGoal = (card: Card) => {
      if (card.suit === 4) {
        this.arcana[card.rank] = card;
      } else {
        this.homes[card.suit].push(card);
      }
    }
    const done = () => {
      if (this.isMoveValid([from, to])) {
        return this.performMove([from, to]);
      }
      return this;
    }
    if (from === 'stow') {
      if (!this.stow) {
        throw new TypeError("Can't move from stow: stow is empty.");
      }
      if (to === 'stow') {
        throw new TypeError("Can't move from stow to stow");
      }

      if (to === 'goal') {
        putGoal(this.stow);
      } else {
        this.field[to].push(this.stow);
      }

      this.stow = undefined;
      return done();
    }

    const colConcerned = this.field[from];
    const card = colConcerned.pop();
    if (!card) {
      throw new TypeError(`Can't move from col ${from}: col is empty`);
    }

    if (to === 'stow') {
      this.stow = card;
      return done();
    }

    if (to === 'goal') {
      putGoal(card);
      return done();
    }

    if (to === from) {
      throw new TypeError(`Can't move card to same space`)
    }
    this.field[to].push(card);
    return done();
  }

  clone() {
    const r = new Playfield();
    r.arcana = [...this.arcana];
    r.homes = [
      [...this.homes[0]],
      [...this.homes[1]],
      [...this.homes[2]],
      [...this.homes[3]],
    ];
    r.stow = this.stow;
    for (let i = 0; i < this.field.length; i++) {
      r.field[i] = [...this.field[i]];
    }
    return r;
  }

  isGameCompleted() {
    return (
      this.arcana.every((el) => !!el)
      && this.homes.every(home => home.length === ranks.length)
      && this.field.every((column) => column.length === 0)
    )
  }

  canGoalCard(card: Card, isFromStow: boolean): boolean {
    if (card.suit === 4) {
      const lowest = this.arcana.findIndex(x => !x);
      const highest = findLastIndex(this.arcana, x => !x);
      return card.rank === lowest || card.rank === highest;
    } else {
      if (isFromStow) return false;
      if (this.stow) return false;
      const home = this.homes[card.suit];
      const onTop = home[home.length - 1];
      if (!onTop) return false;
      return card.rank === onTop.rank + 1;
    }
  }

  isMoveValid([from, to]: Move): boolean {
    const cardConcerned = (from === 'stow') ? this.stow : this.field[from][this.field[from].length-1];
    if (!cardConcerned) {
      return false;
    }
    if (to === 'goal') {
      return this.canGoalCard(cardConcerned, from === 'stow');
    }
    if (to === 'stow') {
      return this.stow === undefined;
    }
    const columnConcerned = this.field[to];
    if (columnConcerned.length === 0) {
      return true;
    }

    const cardOnto = columnConcerned[columnConcerned.length-1];
    return cardConcerned.suit === cardOnto.suit
      && (
        cardConcerned.rank === cardOnto.rank - 1
        || cardConcerned.rank === cardOnto.rank + 1
      );
  }

  canonicalField() {
    let fieldsShallowCopy = [...this.field];
    fieldsShallowCopy.sort((a, b) => {
      if (a.length < b.length) {
        return 1;
      }
      if (a.length === 0 && b.length === 0) {
        return 0;
      }
      const aCard = `${a[0]?.toString()}`;
      const bCard = `${b[0]?.toString()}`;
      return (aCard < bCard) ? -1 : 1;
    })
    return fieldsShallowCopy.map(col => col.map(card => card.toString()).join(',')).join('!')
  }

  stringField() {
    let r = '';
    const max = Math.max(...this.field.map(l => l.length))
    for (let index = 0; index < max; index++) {
      for (let fieldCol = 0; fieldCol < this.field.length; fieldCol++) {
        r += this.field[fieldCol]?.[index]?.toString() ?? '[   ]';
      }
      r += '\n';
    }
    return r;
  }

  stowLine() {
    return !this.stow ? '' : `                                                                                              ~~~~  ${this.stow?.toString() ?? '[   ]'}  ~~~~\n`
  }

  toString() {
    return `→ ${this.arcana.map(x => x?.toString() ?? '[   ]').join('')} ←
                                                                                          ⫍ ${this.homes.map(h => h[h.length - 1]?.toString() ?? '[   ]').join('')} ⫎
${this.stowLine() + this.stringField()}`;
  }
}

bugger({cards: {
  Playfield,
  Card,
  allPossibleMoves,
}})

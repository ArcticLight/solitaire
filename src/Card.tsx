import React from 'react';

const colors = [
  'bg-rose-800 text-red-200 border border-red-800 border-t-red-500',
  'bg-orange-800 text-orange-200 border border-red-800 border-t-red-500',
  'bg-sky-300 border border-sky-300 border-t-sky-100',
  'bg-emerald-200 border border-emerald-300 border-t-emerald-100 text-emerald-00',
  'bg-gradient-to-t from-indigo-800 to-indigo-900 via-blue-900 text-blue-200 border border-blue-800 border-t-blue-600'
]
import { ranks, Suit, suits, Card as C, Playfield } from './solitaire/cards';
export function Card({card, className, renderNull}: {card?: C, className?: string, renderNull?: true}) {
  if (!card) {
    if (!renderNull) {
      return null;
    }
    return <div className={`w-14 h-20 rounded-lg ${className}`}></div>
  }
  const color = colors[card.suit];
  const rank = card.suit === 4 ? card.rank : ranks[card.rank];
  return <div className={`p-1 ${color} drop-shadow-md w-14 h-20 rounded-lg ${className}`}>
    {rank}{suits[card.suit]}
  </div>
}

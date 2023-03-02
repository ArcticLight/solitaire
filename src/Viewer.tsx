import React, {MouseEventHandler, useCallback, useState} from 'react';
import type { Playfield } from './solitaire/cards';
import { NaiveBuildPlayfieldFromStack, Stack, stackFrameToString } from './solitaire/evaluate';
import { Card } from './Card';

function last<T>(a: T[]) {
  return a[a.length-1];
}

export const StackViewer: React.FC<{
  initialCondition: Playfield,
  stack: Stack,
}> = ({
  initialCondition,
  stack
}) => {
  const [splice, setSplice] = useState<number | null>(null);
  const splicedStack = splice ? stack.slice(0, splice) : stack;
  const position = NaiveBuildPlayfieldFromStack(initialCondition, splicedStack);


  return <div className='flex flex-col h-full'>
    <div className='bg-gradient-to-tl from-blue-900 to-sky-700 w-full flex flex-wrap min-h-20 shrink-0 drop-shadow-md'>
      <div id='home' className='relative w-96 flex justify-center grow p-4'>
        <Card className='mx-4' card={last(position.homes[0])}/>
        <Card className='mx-4' card={last(position.homes[1])}/>
        <Card className='mx-4' card={last(position.homes[2])}/>
        <Card className='mx-4' card={last(position.homes[3])}/>
        {position.stow && <div className='absolute inset-0 flex'>
          <div className='absolute inset-0 m-auto h-2 border-t-8 border-dotted border-red-800 drop-shadow-sm w-1/2'/>
          <div className='m-auto p-5 px-8 bg-slate-900/20 rounded-full drop-shadow-lg'>
            <Card card={position.stow} className='m-auto'></Card>
          </div>
        </div>}
      </div>
      <div id='arcana' className='grow flex justify-center -space-x-6 p-4'>
        {position.arcana.map((c, i) => <Card key={i} renderNull className='bg-slate-800' card={c}/>)}
      </div>
    </div>
    <div id='field' className="w-full grow flex min-h-20 min-w-max justify-center overflow-auto">
      {position.field.map((col, i) => (
        <div key={i} className={`w-16 max-h-fit px-1 pt-4 -space-y-10 ${i%2==0 && 'bg-slate-300/40'}`}>
          <div className='w-14 h-16 flex'><div className='mx-auto'>{i}</div></div>
          {col.map((card, j) => (
            <Card key={j} card={card}/>
          ))}
        </div>
      ))}
    </div>

    <div className='bg-blue-200 w-full flex flex-wrap max-w-max gap-1 p-1 overflow-auto'>
      {stack.map((f, i) => <span onClick={() => {
        setSplice((oldSplice) => oldSplice === i + 1 ? null : i + 1)
      }} className={`border-2 border-white rounded-md px-1 cursor-pointer ${splice ? (i + 1 >= splice ? 'bg-slate-400' : '') : ''}`} data-self={i} key={i}>{stackFrameToString(f)}</span>)}
    </div>
  </div>;
}

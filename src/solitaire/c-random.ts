/**
 * A Really Bad(TM) random number generator, but that's
 * dead simple and seedable.
 */
export function makeRand(initialSeed?: number) {
  let sR = initialSeed ?? Math.random() * Math.pow(2, 31);
  // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
  return () => {
    const a = 1103515245;
    const c = 12345;
    const m = Math.pow(2,31);
    sR = (a * sR + c) % m;
    console.log((sR|0)/(m-1))
    return (sR|0)/(m-1);
  }
}

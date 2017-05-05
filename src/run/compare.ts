import resemble = require('node-resemble-js');
import {Readable} from 'stream';
import Pool from '../utilities/pool';

interface Options {
  workers?: number,
}

interface Comparison {
  mismatch: number,
  getDiff(): Readable,
}

export interface Compare {
  (image: string, reference: string): Promise<Comparison>
}

export default function createCompare({workers}: Options): Compare {
  const pool = new Pool<Compare>(() => {
    return function makeComparison(image, reference): Promise<Comparison> {
      return new Promise((resolve) => {
        resemble(image).compareTo(reference).onComplete((data) => {
          resolve({
            mismatch: data.misMatchPercentage / 100,
            getDiff: () => data.getDiffImage().pack(),
          });
        });
      });
    };
  }, {limit: workers});

  return async function compare(image: string, reference: string) {
    const getComparison = await pool.get();
    const comparison = await getComparison(image, reference);
    pool.release(getComparison);
    return comparison;
  }
}

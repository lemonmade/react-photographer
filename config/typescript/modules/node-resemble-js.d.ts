declare module 'node-resemble-js' {
  import {Readable} from 'stream';

  function resemble(image: string): resemble.Resemble;

  namespace resemble {
    export interface Data {
      misMatchPercentage: number,
      isSameDimension: boolean,
      dimensionDifference: {width: number, height: number},
      getDiffImage(): Readable & {pack(): Readable},
    }

    export type Rectangle = [number, number, number, number];

    export interface Resemble {
      compareTo(file: string): this,
      ignoreColors(): this,
      ignoreAntialiasing(): this,
      ignoreRectangles(rectangles: Rectangle[]): this,
      repaint(): this,
      onComplete(callback: (data: Data) => void): this,
    }
  }

  export = resemble;
}

import resemble from 'node-resemble-js';

export default function compareFiles(fileOne, fileTwo) {
  return new Promise((resolve) => {
    resemble(fileOne)
      .compareTo(fileTwo)
      .onComplete((result) => {
        resolve(normalize(result));
      });
  });
}

function normalize(result) {
  return {
    ...result,
    misMatchPercentage: percentageFromString(result.misMatchPercentage),
  };
}

function percentageFromString(string) {
  return Number(string) / 100;
}

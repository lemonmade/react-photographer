// @flow

import React from 'react';
import Relay from 'react-relay';

function Home({viewer: {snapshots}}) {
  return (
    <div>
      <h1>Snapshots</h1>
      <ul>
        {snapshots.map(({name, stack, passed, referenceImage, compareImage}, index) => {
          return (
            <li key={index}>
              <div>{[...stack, name].join('/')} ({passed ? 'passed' : 'failed'})</div>
              <div>
                <img src={`/${referenceImage}`} alt="reference" />
                <img src={`/${compareImage}`} alt="compare" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


const HomeContainer = Relay.createContainer(Home, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        snapshots {
          name
          stack
          passed
          referenceImage
          compareImage
        }
      }
    `,
  },
});

export default HomeContainer;

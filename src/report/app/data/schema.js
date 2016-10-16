// @flow

import fs from 'fs-extra';
import {buildSchema} from 'graphql';

import Database from '../../../database';

export async function createRootValue(config) {
  const database = new Database(config);

  return {
    viewer() {
      return {
        snapshots() {
          return database.getAll();
        },
      };
    },
    snapshot({id}) {
      return database.get({id});
    },
    async acceptSnapshot({id}) {
      const snapshot = await database.get({id});
      const {result, image: {src: referenceImagePath}} = snapshot;

      const newResult = {
        ...result,
        passed: true,
        failed: false,
        skipped: false,
      };

      delete newResult.image;
      delete newResult.diff;

      const newSnapshot = {
        ...snapshot,
        status: 'ACCEPTED',
        image: result.image,
        result: newResult,
      };

      fs.copySync(newSnapshot.image.src, referenceImagePath);
      return await database.set(newSnapshot, {dump: true});
    },
  };
}

export const schema = buildSchema(`
  type Viewport {
    height: Int!
    width: Int!
  }

  type Image {
    src: String!
    height: Float!
    width: Float!
  }

  type Result {
    passed: Boolean!
    failed: Boolean!
    recorded: Boolean!
    skipped: Boolean!
    threshold: Float!
    mismatch: Float!
    duration: Float!
    reason: String
    details: String
    image: Image
    diff: Image
  }

  enum Status {
    UNCHANGED
    ACCEPTED
  }

  type Snapshot {
    id: ID!
    name: String!
    component: String!
    groups: [String!]!
    viewport: Viewport!
    hasMultipleViewports: Boolean!
    status: Status!
    image: Image
    result: Result
  }

  type Viewer {
    snapshots: [Snapshot!]!
  }

  type Query {
    viewer: Viewer!
    snapshot(id: ID!): Snapshot
  }

  type Mutation {
    acceptSnapshot(id: ID!): Snapshot
  }
`);

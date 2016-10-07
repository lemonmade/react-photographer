// @flow

import fs from 'fs-extra';
import {join} from 'path';

import {buildSchema} from 'graphql';

export async function createRootValue({detailsFile, resultsFile}) {
  let snapshotDetails;
  let snapshotResults;

  try {
    snapshotDetails = fs.readJSONSync(detailsFile)
  } catch (error) {
    snapshotDetails = {snapshots: []};
  }

  try {
    snapshotResults = fs.readJSONSync(resultsFile);
  } catch (error) {
    snapshotResults = {};
  }

  return {
    snapshots() { return []; },
    snapshot({id}) {},
    acceptSnapshot({id}) {},
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
    image: Image
    diff: Image
  }

  enum Status {
    TESTED
    UNTESTED
    ACCEPTED
  }

  type Snapshot {
    id: ID!
    name: String!
    component: String!
    groups: [String!]!
    status: Status!
    viewport: Viewport!
    hasMultipleViewports: Boolean!
    image: Image
    result: Result
  }

  type Query {
    snapshots: [Snapshot!]!
    snapshot(id: ID!): Snapshot
  }

  type Mutation {
    acceptSnapshot(id: ID!): Snapshot
  }
`);

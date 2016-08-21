import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql';

import data from '../../../snapshots/data.json';

const ViewportType = new GraphQLObjectType({
  name: 'Viewport',
  fields: {
    height: {type: GraphQLInt},
    width: {type: GraphQLInt},
  },
});

const SnapshotType = new GraphQLObjectType({
  name: 'Snapshot',
  fields: {
    name: {type: GraphQLString},
    stack: {type: new GraphQLList(GraphQLString)},
    passed: {type: GraphQLBoolean},
    record: {type: GraphQLBoolean},
    skip: {type: GraphQLBoolean},
    exclusive: {type: GraphQLBoolean},
    threshold: {type: GraphQLFloat},
    mismatch: {type: GraphQLFloat},
    referenceImage: {type: GraphQLString},
    compareImage: {type: GraphQLString},
    diffImage: {type: GraphQLString},
  },
});

const ViewerType = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    snapshots: {type: new GraphQLList(SnapshotType)},
  },
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      viewer: {
        type: ViewerType,
        resolve: () => data,
      },
    },
  }),
});

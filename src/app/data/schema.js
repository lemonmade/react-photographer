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
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    component: {type: GraphQLString},
    groups: {type: new GraphQLList(GraphQLString)},
    passed: {type: GraphQLBoolean},
    failed: {type: GraphQLBoolean},
    recorded: {type: GraphQLBoolean},
    skipped: {type: GraphQLBoolean},
    threshold: {type: GraphQLFloat},
    mismatch: {type: GraphQLFloat},
    referenceImage: {type: GraphQLString},
    compareImage: {type: GraphQLString},
    diffImage: {type: GraphQLString},
    viewport: {type: ViewportType},
    hasMultipleViewports: {type: GraphQLBoolean},
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
      snapshot: {
        type: SnapshotType,
        args: {
          id: {type: GraphQLString},
        },
        resolve: (_, {id}) => data.snapshots.find((snapshot) => snapshot.id === id),
      },
    },
  }),
});

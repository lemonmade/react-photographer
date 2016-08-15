import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

const data = {
  name: 'Chris Sauve',
};

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    name: {type: GraphQLString},
  },
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: UserType,
        resolve: () => data,
      },
    },
  }),
});

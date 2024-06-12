const { GraphQLSchema } = require('graphql');
const RootQuery = require('../queries/index');
const RootMutation = require('../mutations/index');

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

module.exports = schema;

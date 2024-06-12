const { GraphQLObjectType, GraphQLString, GraphQLBoolean } = require('graphql');

const MutationResponseType = new GraphQLObjectType({
  name: 'MutationResponse',
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
  },
});

module.exports = MutationResponseType;

const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');

const SkinType = new GraphQLObjectType({
  name: 'Skin',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    ownership: { type: new GraphQLList(GraphQLString) },
  },
});

module.exports = SkinType;

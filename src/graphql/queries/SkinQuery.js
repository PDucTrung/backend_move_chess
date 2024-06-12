const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
const SkinType = require('../types/SkinType');
const db = require("../../models");
const Skin = db.skin;

const SkinQuery = new GraphQLObjectType({
  name: 'SkinQuery',
  fields: {
    skins: {
      type: new GraphQLList(SkinType),
      resolve() {
        return Skin.find().exec();
      },
    },
    skinById: {
      type: SkinType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Skin.findById(args.id).exec();
      },
    },
    skinsByType: {
      type: new GraphQLList(SkinType),
      args: { type: { type: GraphQLString } },
      resolve(parent, args) {
        return Skin.find({ type: args.type }).exec();
      },
    },
  },
});

module.exports = SkinQuery;

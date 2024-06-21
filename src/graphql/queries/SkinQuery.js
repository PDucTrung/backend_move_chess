const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require("graphql");
const SkinType = require("../types/SkinType");
const db = require("../../models");
const Skin = db.skin;

const SkinQuery = new GraphQLObjectType({
  name: "SkinQuery",
  fields: {
    skins: {
      type: new GraphQLList(SkinType),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Skin.find().sort({ _id: sort }).skip(offset).limit(limit).exec();
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
      args: {
        type: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Skin.find({ type: args.type })
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .exec();
      },
    },
  },
});

module.exports = SkinQuery;

const { GraphQLObjectType, GraphQLString } = require('graphql');
const MutationResponseType = require('../types/MutationResponseType');
const db = require("../../models");
const Skin = db.skin;

const SkinMutation = new GraphQLObjectType({
  name: 'SkinMutation',
  fields: {
    createSkin: {
      type: MutationResponseType,
      args: {
        name: { type: GraphQLString },
        type: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const newSkin = new Skin({
            name: args.name,
            type: args.type,
          });

          await newSkin.save();
          return { success: true, message: 'Skin created successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    updateSkin: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const skin = await Skin.findById(args.id);
          if (!skin) {
            return { success: false, message: 'Skin not found' };
          }

          skin.name = args.name || skin.name;
          skin.type = args.type || skin.type;

          await skin.save();
          return { success: true, message: 'Skin updated successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    deleteSkin: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const skin = await Skin.findById(args.id);
          if (!skin) {
            return { success: false, message: 'Skin not found' };
          }

          await skin.remove();
          return { success: true, message: 'Skin deleted successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = SkinMutation;

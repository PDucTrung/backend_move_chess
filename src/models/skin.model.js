const SkinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["piece", "board"], required: true },
  ownership: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
});

module.exports = mongoose.model("Skin", SkinSchema);

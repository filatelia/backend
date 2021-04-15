const { Schema, model } = require("mongoose");

const SocketSchema = Schema(
  {
    id_room: {
      type:  Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    type: { type: String, default: "default" },
    new_message: { type: Number, required: false, default: 0 },
    users: [
      {
        id_usuario: {
          type:  Schema.Types.ObjectId,
          ref: "Usuarios",
          unique: true,
          required: true,
        },
        status: { type: Boolean, default: true },
      },
    ],
    conversation: [
      {
        id_usuario: { type:  Schema.Types.ObjectId, ref: "Usuarios" },
        message: { type: String, default: "" },
        created_at: { type: Date, default: Date.now },
        deleted_at: { type: Date, default: null },
        read: { type: Number, required: false, default: 3 },
      },
    ],
  },
  { collection: "bdfc_room" }
);
module.exports = model("Chat", SocketSchema);

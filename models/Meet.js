const mongoose = require("mongoose");

const MeetSchema = new mongoose.Schema(
  {
    invitedUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
      },
    ],
    host: {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
    },
    channelId: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Meet = mongoose.model("Meet", MeetSchema);

module.exports = Meet;

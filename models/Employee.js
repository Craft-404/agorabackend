const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: `Enter a valid Email address!`,
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (phone) {
          return /^\d{10}$/.test(phone);
        },
        message: `Enter a valid phone number!`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
    },

    token: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      immutable: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now(),
    },
    fcmToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;

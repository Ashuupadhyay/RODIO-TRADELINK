const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    vehicleTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

routeSchema.index({
  from: 1,
  to: 1,
  isActive: 1,
});

module.exports =
  mongoose.models.Route ||
  mongoose.model("Route", routeSchema);
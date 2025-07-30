const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  timeDuration: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  }
});

module.exports = mongoose.model("SubSection", subSectionSchema);

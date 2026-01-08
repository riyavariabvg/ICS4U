import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  semester: { type: String },
  room: { type: String },
  schedule: { type: String }
});

export default mongoose.model("Course", courseSchema);
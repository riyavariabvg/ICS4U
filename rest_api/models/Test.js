import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  testName: { type: String, required: true },
  date: { type: Date },
  mark: { type: Number, required: true },
  outOf: { type: Number, required: true },
  weight: { type: Number }
});

export default mongoose.model("Test", testSchema);
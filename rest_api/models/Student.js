import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  grade: { type: Number, required: true },
  studentNumber: { type: String, required: true },
  homeroom: { type: String }
});

export default mongoose.model("Student", studentSchema);
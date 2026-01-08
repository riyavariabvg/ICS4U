import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js";
import Course from "./models/Course.js";
import Test from "./models/Test.js";

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* =====================
   TEACHERS
===================== */

app.get("/teachers", async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

app.get("/teachers/:id", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }
  res.json(teacher);
});

app.post("/teachers", async (req, res) => {
  const teacher = new Teacher(req.body);
  await teacher.save();
  res.status(201).json(teacher);
});

app.put("/teachers/:id", async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }
  res.json(teacher);
});

app.delete("/teachers/:id", async (req, res) => {
  const courses = await Course.find({ teacher: req.params.id });
  if (courses.length > 0) {
    return res.status(400).json({ error: "Teacher assigned to a course" });
  }
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ message: "Teacher deleted" });
});

/* =====================
   COURSES
===================== */

app.get("/courses", async (req, res) => {
  const courses = await Course.find().populate("teacher");
  res.json(courses);
});

app.get("/courses/:id", async (req, res) => {
  const course = await Course.findById(req.params.id).populate("teacher");
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});

app.post("/courses", async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.status(201).json(course);
});

app.put("/courses/:id", async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});

app.delete("/courses/:id", async (req, res) => {
  const tests = await Test.find({ course: req.params.id });
  if (tests.length > 0) {
    return res.status(400).json({ error: "Course has tests" });
  }
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course deleted" });
});

/* =====================
   STUDENTS
===================== */

app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get("/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

app.post("/students", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.status(201).json(student);
});

app.put("/students/:id", async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

app.delete("/students/:id", async (req, res) => {
  const tests = await Test.find({ student: req.params.id });
  if (tests.length > 0) {
    return res.status(400).json({ error: "Student has tests" });
  }
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
});

/* =====================
   TESTS
===================== */

app.get("/tests", async (req, res) => {
  const tests = await Test.find()
    .populate("student")
    .populate("course");
  res.json(tests);
});

app.get("/tests/:id", async (req, res) => {
  const test = await Test.findById(req.params.id)
    .populate("student")
    .populate("course");
  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }
  res.json(test);
});

app.post("/tests", async (req, res) => {
  const test = new Test(req.body);
  await test.save();
  res.status(201).json(test);
});

app.delete("/tests/:id", async (req, res) => {
  await Test.findByIdAndDelete(req.params.id);
  res.json({ message: "Test deleted" });
});

// server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

// file paths
const TEACHERS_FILE = './data/teachers.json';
const COURSES_FILE = './data/courses.json';
const STUDENTS_FILE = './data/students.json';
const TESTS_FILE = './data/tests.json';

// load data from JSON file
function loadData(filename) {
  if (!fs.existsSync(filename)) {
    return [];
  }
  const data = fs.readFileSync(filename, 'utf8');
  return JSON.parse(data);
}

// save data to JSON file
function saveData(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

// get next ID for new items
function getNextId(array) {
  if (array.length === 0) return 1;
  const maxId = Math.max(...array.map(item => item.id));
  return maxId + 1;
}

// teacher routes 

// get all teachers 
app.get('/teachers', (req, res) => {
  const teachers = loadData(TEACHERS_FILE);
  res.json(teachers);
});

// get one teacher
app.get('/teachers/:id', (req, res) => {
  const teachers = loadData(TEACHERS_FILE);
  const teacher = teachers.find(t => t.id === parseInt(req.params.id));
  
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  res.json(teacher);
});

// create new teacher 
app.post('/teachers', (req, res) => {
  const { firstName, lastName, email, department, room } = req.body;
  
  if (!firstName || !lastName || !email || !department) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const teachers = loadData(TEACHERS_FILE);
  const newTeacher = {
    id: getNextId(teachers),
    firstName,
    lastName,
    email,
    department,
    room: room || ''
  };
  
  teachers.push(newTeacher);
  saveData(TEACHERS_FILE, teachers);
  res.status(201).json(newTeacher);
});

// update teacher 
app.put('/teachers/:id', (req, res) => {
  const teachers = loadData(TEACHERS_FILE);
  const index = teachers.findIndex(t => t.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  teachers[index] = { ...teachers[index], ...req.body, id: teachers[index].id };
  saveData(TEACHERS_FILE, teachers);
  res.json(teachers[index]);
});

// delete teacher 
app.delete('/teachers/:id', (req, res) => {
  const teachers = loadData(TEACHERS_FILE);
  const courses = loadData(COURSES_FILE);
  const id = parseInt(req.params.id);
  
  // check if teacher is assigned to any course
  const hasAssignedCourse = courses.some(c => c.teacherId === id);
  if (hasAssignedCourse) {
    return res.status(400).json({ error: 'Cannot delete teacher assigned to a course' });
  }
  
  const newTeachers = teachers.filter(t => t.id !== id);
  if (newTeachers.length === teachers.length) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  saveData(TEACHERS_FILE, newTeachers);
  res.json({ message: 'Teacher deleted' });
});

// course routes 

// get all courses
app.get('/courses', (req, res) => {
  const courses = loadData(COURSES_FILE);
  res.json(courses);
});

// get one course
app.get('/courses/:id', (req, res) => {
  const courses = loadData(COURSES_FILE);
  const course = courses.find(c => c.id === parseInt(req.params.id));
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json(course);
});

// create new course
app.post('/courses', (req, res) => {
  const { code, name, teacherId, semester, room, schedule } = req.body;
  
  if (!code || !name || !teacherId || !semester || !room) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const teachers = loadData(TEACHERS_FILE);
  const teacherExists = teachers.some(t => t.id === parseInt(teacherId));
  if (!teacherExists) {
    return res.status(400).json({ error: 'Invalid teacherId' });
  }
  
  const courses = loadData(COURSES_FILE);
  const newCourse = {
    id: getNextId(courses),
    code,
    name,
    teacherId: parseInt(teacherId),
    semester,
    room,
    schedule: schedule || ''
  };
  
  courses.push(newCourse);
  saveData(COURSES_FILE, courses);
  res.status(201).json(newCourse);
});

// update course
app.put('/courses/:id', (req, res) => {
  const courses = loadData(COURSES_FILE);
  const index = courses.findIndex(c => c.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  if (req.body.teacherId) {
    const teachers = loadData(TEACHERS_FILE);
    const teacherExists = teachers.some(t => t.id === parseInt(req.body.teacherId));
    if (!teacherExists) {
      return res.status(400).json({ error: 'Invalid teacherId' });
    }
  }
  
  courses[index] = { ...courses[index], ...req.body, id: courses[index].id };
  saveData(COURSES_FILE, courses);
  res.json(courses[index]);
});

// delete course
app.delete('/courses/:id', (req, res) => {
  const courses = loadData(COURSES_FILE);
  const tests = loadData(TESTS_FILE);
  const id = parseInt(req.params.id);
  
  const hasTests = tests.some(t => t.courseId === id);
  if (hasTests) {
    return res.status(400).json({ error: 'Cannot delete course with existing tests' });
  }
  
  const newCourses = courses.filter(c => c.id !== id);
  if (newCourses.length === courses.length) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  saveData(COURSES_FILE, newCourses);
  res.json({ message: 'Course deleted' });
});

// student routes 

// get all students 
app.get('/students', (req, res) => {
  const students = loadData(STUDENTS_FILE);
  res.json(students);
});

// get one student
app.get('/students/:id', (req, res) => {
  const students = loadData(STUDENTS_FILE);
  const student = students.find(s => s.id === parseInt(req.params.id));
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

// create new student
app.post('/students', (req, res) => {
  const { firstName, lastName, grade, studentNumber, homeroom } = req.body;
  
  if (!firstName || !lastName || grade === undefined || !studentNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const students = loadData(STUDENTS_FILE);
  const newStudent = {
    id: getNextId(students),
    firstName,
    lastName,
    grade: parseInt(grade),
    studentNumber,
    homeroom: homeroom || ''
  };
  
  students.push(newStudent);
  saveData(STUDENTS_FILE, students);
  res.status(201).json(newStudent);
});

// update student 
app.put('/students/:id', (req, res) => {
  const students = loadData(STUDENTS_FILE);
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  students[index] = { ...students[index], ...req.body, id: students[index].id };
  saveData(STUDENTS_FILE, students);
  res.json(students[index]);
});

// delete student
app.delete('/students/:id', (req, res) => {
  const students = loadData(STUDENTS_FILE);
  const tests = loadData(TESTS_FILE);
  const id = parseInt(req.params.id);
  
  const hasTests = tests.some(t => t.studentId === id);
  if (hasTests) {
    return res.status(400).json({ error: 'Cannot delete student with existing tests' });
  }
  
  const newStudents = students.filter(s => s.id !== id);
  if (newStudents.length === students.length) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  saveData(STUDENTS_FILE, newStudents);
  res.json({ message: 'Student deleted' });
});

// test routes 

// get all tests
app.get('/tests', (req, res) => {
  const tests = loadData(TESTS_FILE);
  res.json(tests);
});

// get one test
app.get('/tests/:id', (req, res) => {
  const tests = loadData(TESTS_FILE);
  const test = tests.find(t => t.id === parseInt(req.params.id));
  
  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }
  res.json(test);
});

// create new test
app.post('/tests', (req, res) => {
  const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;
  
  if (!studentId || !courseId || !testName || date === undefined || mark === undefined || outOf === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const students = loadData(STUDENTS_FILE);
  const courses = loadData(COURSES_FILE);
  
  const studentExists = students.some(s => s.id === parseInt(studentId));
  const courseExists = courses.some(c => c.id === parseInt(courseId));
  
  if (!studentExists) {
    return res.status(400).json({ error: 'Invalid studentId' });
  }
  if (!courseExists) {
    return res.status(400).json({ error: 'Invalid courseId' });
  }
  
  const tests = loadData(TESTS_FILE);
  const newTest = {
    id: getNextId(tests),
    studentId: parseInt(studentId),
    courseId: parseInt(courseId),
    testName,
    date,
    mark: parseFloat(mark),
    outOf: parseFloat(outOf),
    weight: weight !== undefined ? parseFloat(weight) : null
  };
  
  tests.push(newTest);
  saveData(TESTS_FILE, tests);
  res.status(201).json(newTest);
});

// update test
app.put('/tests/:id', (req, res) => {
  const tests = loadData(TESTS_FILE);
  const index = tests.findIndex(t => t.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Test not found' });
  }
  
  if (req.body.studentId) {
    const students = loadData(STUDENTS_FILE);
    const studentExists = students.some(s => s.id === parseInt(req.body.studentId));
    if (!studentExists) {
      return res.status(400).json({ error: 'Invalid studentId' });
    }
  }
  
  if (req.body.courseId) {
    const courses = loadData(COURSES_FILE);
    const courseExists = courses.some(c => c.id === parseInt(req.body.courseId));
    if (!courseExists) {
      return res.status(400).json({ error: 'Invalid courseId' });
    }
  }
  
  tests[index] = { ...tests[index], ...req.body, id: tests[index].id };
  saveData(TESTS_FILE, tests);
  res.json(tests[index]);
});

// delete test
app.delete('/tests/:id', (req, res) => {
  const tests = loadData(TESTS_FILE);
  const id = parseInt(req.params.id);
  
  const newTests = tests.filter(t => t.id !== id);
  if (newTests.length === tests.length) {
    return res.status(404).json({ error: 'Test not found' });
  }
  
  saveData(TESTS_FILE, newTests);
  res.json({ message: 'Test deleted' });
});

// start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
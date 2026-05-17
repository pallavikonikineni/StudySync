import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {

  const [students, setStudents] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [taskData, setTaskData] = useState({
    taskName: "",
    subject: "",
    completed: false,
    studentEmail: ""
  });

  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    selectedCourse: "Java Full Stack",
    totalStudyHours: 0,
    dailyGoalHours: 2,
    weakSubject: "None",
    completedTasks: 0,
    studyStreak: 1
  });

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(true);

  const [loggedInUser, setLoggedInUser] = useState("");

  useEffect(() => {

    getStudents();

    getTasks();

  }, []);

  const addNotification = (message) => {

    const time = new Date().toLocaleTimeString();

    setNotifications((prev) => [
      {
        id: Date.now(),
        message,
        time
      },
      ...prev
    ]);
  };

  const getTasks = async () => {

    const response = await axios.get(
      "http://localhost:8080/tasks"
    );

    setTasks(response.data);
  };

  const handleTaskChange = (e) => {

    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value
    });
  };

  const addTask = async () => {

    if(
      taskData.taskName === "" ||
      taskData.subject === ""
    ){
      toast.error("Please fill task details");
      return;
    }

    await axios.post(
      "http://localhost:8080/addTask",
      {
        ...taskData,
        studentEmail: loggedInUser
      }
    );

    toast.success("Task Added");

    addNotification("New Study Task Added");

    setTaskData({
      taskName: "",
      subject: "",
      completed: false,
      studentEmail: ""
    });

    getTasks();
  };

  const completeTask = async (task) => {

    await axios.put(
      `http://localhost:8080/task/${task.id}`,
      {
        ...task,
        completed: true
      }
    );

    toast.success("Task Completed");

    addNotification(
      `Task "${task.taskName}" Completed`
    );

    getTasks();
  };

  const deleteTask = async (id) => {

    await axios.delete(
      `http://localhost:8080/task/${id}`
    );

    toast.error("Task Deleted");

    getTasks();
  };

  const getStudents = async () => {

    const response = await axios.get(
      "http://localhost:8080/students"
    );

    setStudents(response.data);
  };

  const handleChange = (e) => {

    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {

    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const loginStudent = async () => {

    if(
      loginData.email === "" ||
      loginData.password === ""
    ){
      toast.error("Please fill login details");
      return;
    }

    const response = await axios.post(
      "http://localhost:8080/login",
      loginData
    );

    if(response.data){

      setLoggedInUser(response.data.name);

      toast.success("Login Successful");

      addNotification("User Logged In");

      setIsLoggedIn(true);

    } else {

      toast.error("Invalid Email or Password");
    }
  };

  const createAccount = async () => {

    if (
      student.name === "" ||
      student.email === "" ||
      student.password === ""
    ) {
      toast.error("Please fill all fields");
      return;
    }

    await axios.post(
      "http://localhost:8080/register",
      student
    );

    toast.success("Account Created Successfully");

    addNotification("New Account Created");

    setLoggedInUser(student.name);

    setIsLoggedIn(true);

    setStudent({
      name: "",
      email: "",
      password: "",
      selectedCourse: "Java Full Stack",
      totalStudyHours: 0,
      dailyGoalHours: 2,
      weakSubject: "None",
      completedTasks: 0,
      studyStreak: 1
    });

    getStudents();
  };

  const logout = () => {

    addNotification("User Logged Out");

    setIsLoggedIn(false);

    setLoginData({
      email: "",
      password: ""
    });

    toast.info("Logged Out Successfully");
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const deleteStudent = async (id) => {

    await axios.delete(
      `http://localhost:8080/student/${id}`
    );

    toast.error("Student Deleted Successfully");

    addNotification(`Student ID ${id} Deleted`);

    getStudents();
  };
  const getStudySuggestion = () => {

  const totalHours = students.reduce(
    (total, s) =>
      total + s.totalStudyHours,
    0
  );

  const completedTaskCount =
    tasks.filter(
      (t) => t.completed
    ).length;

  if(totalHours < 5){

    return "Study hours are low. Spend more time learning daily.";

  }

  if(completedTaskCount >= 5){

    return "Excellent productivity. Keep maintaining consistency.";

  }

  const weakStudents = students.filter(
    (s) =>
      s.weakSubject !== "None"
  );

  if(weakStudents.length > 0){

    return `Focus more on ${weakStudents[0].weakSubject} for better performance.`;

  }

  return "You are performing well. Keep learning consistently.";
};
const leaderboardData = [...students]
  .sort(
    (a, b) =>
      b.totalStudyHours - a.totalStudyHours
  )
  .slice(0, 5);

  const chartData = [
    {
      name: "Students",
      count: students.length
    },
    {
      name: "Search",
      count: students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ).length
    }
  ];

  if(!isLoggedIn){

    return(

      <div className={darkMode ? "dark" : "light"}>

        <div className="container">

          <h1>
            {
              isRegisterMode
              ? "Create Account"
              : "StudySync Login"
            }
          </h1>

          <button onClick={toggleTheme}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <br /><br />

          {
            isRegisterMode && (

              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={student.name}
                  onChange={handleChange}
                />

                <select
                  name="selectedCourse"
                  value={student.selectedCourse}
                  onChange={handleChange}
                  className="course-select"
                >

                  <option>Java Full Stack</option>
                  <option>MERN Stack</option>
                  <option>Python Development</option>
                  <option>Machine Learning</option>
                  <option>Data Structures & Algorithms</option>
                  <option>Cloud Computing</option>
                  <option>AI & Deep Learning</option>
                  <option>Cyber Security</option>
                  <option>DevOps</option>
                  <option>UI/UX Design</option>

                </select>
              </>
            )
          }

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={
              isRegisterMode
              ? student.email
              : loginData.email
            }
            onChange={
              isRegisterMode
              ? handleChange
              : handleLoginChange
            }
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={
              isRegisterMode
              ? student.password
              : loginData.password
            }
            onChange={
              isRegisterMode
              ? handleChange
              : handleLoginChange
            }
          />

          {
            isRegisterMode ? (

              <button onClick={createAccount}>
                Create Account
              </button>

            ) : (

              <button onClick={loginStudent}>
                Login
              </button>

            )
          }

          <br /><br />

          <button
            onClick={() =>
              setIsRegisterMode(!isRegisterMode)
            }
          >
            {
              isRegisterMode
              ? "Already have an account? Login"
              : "Create New Account"
            }
          </button>

          <ToastContainer />

        </div>

      </div>
    );
  }

  return (

    <div className={darkMode ? "dark" : "light"}>

      <div className="main-layout">

        <div className="sidebar">

          <div className="logo">
            StudySync
          </div>

          <div className="sidebar-menu">

            <div className="menu-item">
              Dashboard
            </div>

            <div className="menu-item">
              Students
            </div>

            <div className="menu-item">
              Analytics
            </div>

            <div className="menu-item">
              Settings
            </div>

          </div>

        </div>

        <div className="content">

          <div className="container">

            <div className="profile-header">

              <div className="profile-left">

                <div className="avatar">
                  {loggedInUser.charAt(0).toUpperCase()}
                </div>

                <div>

                  <h1>
                    Welcome, {loggedInUser}
                  </h1>

                  <p className="subtitle">
                    Manage your StudySync Dashboard
                  </p>

                </div>

              </div>

            </div>

            <div className="top-buttons">

              <button onClick={toggleTheme}>
                {
                  darkMode
                  ? "Light Mode"
                  : "Dark Mode"
                }
              </button>

              <CSVLink
                data={students}
                filename={"students_report.csv"}
                className="csv-link"
              >
                Export CSV
              </CSVLink>

              <button onClick={logout}>
                Logout
              </button>

            </div>

            <div className="dashboard-cards">

              <div className="card">

                <h3>Total Students</h3>

                <p>{students.length}</p>

              </div>

              <div className="card">

                <h3>Search Results</h3>

                <p>
                  {
                    students.filter((s) =>
                      s.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    ).length
                  }
                </p>

              </div>

              <div className="card">

                <h3>Study Hours</h3>

                <p>
                  {
                    students.reduce(
                      (total, s) =>
                        total + s.totalStudyHours,
                      0
                    )
                  }
                </p>

              </div>

              <div className="card">

                <h3>User Productivity</h3>

                <p>
                  {
                    students.reduce(
                      (total, s) =>
                        total + s.completedTasks,
                      0
                    )
                  }
                </p>

              </div>

              <div className="card">

                <h3>Total Tasks</h3>

                <p>{tasks.length}</p>

              </div>

              <div className="card">

                <h3>Completed Tasks</h3>

                <p>
                  {
                    tasks.filter(
                      (t) => t.completed
                    ).length
                  }
                </p>

              </div>
              <div className="card">

  <h3>Study Streak</h3>

  <p>
    🔥
    {" "}
    {
      students.reduce(
        (max, s) =>
          s.studyStreak > max
            ? s.studyStreak
            : max,
        0
      )
    }
    {" "}
    Days
  </p>

</div>

            </div>
            <div className="card">

  <h3>AI Study Suggestions</h3>

  <p
    style={{
      fontSize:"18px",
      lineHeight:"32px"
    }}
  >
    {getStudySuggestion()}
  </p>

</div>

<div className="card">

  <h3>Student Analytics</h3>

  <ResponsiveContainer
    width="100%"
    height={300}
  >

    <BarChart data={chartData}>

      <XAxis dataKey="name" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="count"
        fill="#00bcd4"
      />

    </BarChart>

  </ResponsiveContainer>

</div>

            <br />

            <input
              type="text"
              placeholder="Search Student"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <h2>Students List</h2>

            {
              students
                .filter((s) =>
                  s.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((s) => (

                  <div
                    className="student-card"
                    key={s.id}
                  >

                    <p>
                      <strong>ID:</strong>
                      {" "}
                      {s.id}
                    </p>

                    <p>
                      <strong>Name:</strong>
                      {" "}
                      {s.name}
                    </p>

                    <p>
                      <strong>Email:</strong>
                      {" "}
                      {s.email}
                    </p>

                    <p>
                      <strong>Course:</strong>
                      {" "}
                      {s.selectedCourse}
                    </p>

                    <p>
                      <strong>Study Hours:</strong>
                      {" "}
                      {s.totalStudyHours}
                    </p>

                    <p>
                      <strong>Weak Subject:</strong>
                      {" "}
                      {s.weakSubject}
                    </p>

                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedStudent(s)
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteStudent(s.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))
            }

            <div className="card">

              <h2>Study Task Manager</h2>

              <input
                type="text"
                name="taskName"
                placeholder="Enter Study Task"
                value={taskData.taskName}
                onChange={handleTaskChange}
              />

              <input
                type="text"
                name="subject"
                placeholder="Enter Subject"
                value={taskData.subject}
                onChange={handleTaskChange}
              />

              <button onClick={addTask}>
                Add Task
              </button>

            </div>

            <h2>Study Tasks</h2>

            {
              tasks.map((task) => (

                <div
                  className="student-card"
                  key={task.id}
                >

                  <p>
                    <strong>Task:</strong>
                    {" "}
                    {task.taskName}
                  </p>

                  <p>
                    <strong>Subject:</strong>
                    {" "}
                    {task.subject}
                  </p>

                  <p>
                    <strong>Status:</strong>
                    {" "}
                    {
                      task.completed
                      ? "Completed"
                      : "Pending"
                    }
                  </p>

                  {
                    !task.completed && (

                      <button
                        className="view-btn"
                        onClick={() =>
                          completeTask(task)
                        }
                      >
                        Mark Completed
                      </button>

                    )
                  }

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete Task
                  </button>

                </div>

              ))
            }
            <div className="card">

  <h2>Leaderboard</h2>

  {
    leaderboardData.length === 0 ? (

      <p>No Students Yet</p>

    ) : (

      leaderboardData.map((s, index) => (

        <div
          key={s.id}
          style={{
            marginBottom:"15px",
            padding:"12px",
            borderRadius:"10px",
            background:"#00bcd420"
          }}
        >

          <p>

            <strong>
              {
                index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : "🏅"
              }
            </strong>

            {" "}

            {s.name}

          </p>

          <p>
            Study Hours:
            {" "}
            {s.totalStudyHours}
          </p>

          <p>
            Completed Tasks:
            {" "}
            {s.completedTasks}
          </p>

        </div>

      ))

    )
  }

</div>

            <div className="notification-section">

              <h2>Recent Activity</h2>

              {
                notifications.length === 0 ? (

                  <div className="notification-card">
                    No Activity Yet
                  </div>

                ) : (

                  notifications.map((note) => (

                    <div
                      className="notification-card"
                      key={note.id}
                    >

                      <div>
                        {note.message}
                      </div>

                      <div className="notification-time">
                        {note.time}
                      </div>

                    </div>

                  ))

                )
              }

            </div>

            {
              selectedStudent && (

                <div className="modal-overlay">

                  <div className="modal">

                    <h2>Edit Student</h2>

                    <input
                      type="text"
                      value={selectedStudent.name}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          name:e.target.value
                        })
                      }
                    />

                    <input
                      type="email"
                      value={selectedStudent.email}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          email:e.target.value
                        })
                      }
                    />

                    <input
                      type="password"
                      value={selectedStudent.password}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          password:e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      value={selectedStudent.totalStudyHours}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          totalStudyHours:
                            e.target.value
                        })
                      }
                    />

                    <input
                      type="text"
                      value={selectedStudent.weakSubject}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          weakSubject:
                            e.target.value
                        })
                      }
                    />
                    <input
  type="number"
  value={selectedStudent.studyStreak}
  onChange={(e) =>
    setSelectedStudent({
      ...selectedStudent,
      studyStreak:e.target.value
    })
  }
/>

                    <button
                      onClick={async () => {

                        await axios.put(
                          `http://localhost:8080/student/${selectedStudent.id}`,
                          selectedStudent
                        );

                        toast.success(
                          "Student Updated Successfully"
                        );

                        addNotification(
                          `Student ${selectedStudent.name} Updated`
                        );

                        getStudents();

                        setSelectedStudent(null);
                      }}
                    >
                      Save Changes
                    </button>

                    <button
                      className="close-btn"
                      onClick={() =>
                        setSelectedStudent(null)
                      }
                    >
                      Close
                    </button>

                  </div>

                </div>

              )
            }

            <ToastContainer />

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
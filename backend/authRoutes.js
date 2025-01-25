const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db");
router.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  // Input validation
  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      field: !full_name
        ? "full_name"
        : !email
        ? "email"
        : !password
        ? "password"
        : null,
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      field: "email",
    });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
      field: "password",
    });
  }

  try {
    // Check if user exists or not
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password logic
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user
    await db.execute(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword]
    );

    res.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate the JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Login Server error", error: error.message });
  }
});

// Create a new task
router.post("/tasks", async (req, res) => {
  console.log("api calling");
  const { title, description, status } = req.body;
  console.log("req.body", req.body);

  // Input validation for title
  if (!title) {
    return res.status(400).json({
      message: "Title is required",
      field: "title",
    });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO tasks (title, description,status) VALUES (?, ?, ?)",
      [title, description, status || null]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating task",
      error: error.message,
    });
  }
});

// Get all tasks data
router.get("/tasks", async (req, res) => {
  try {
    const [tasks] = await db.execute("SELECT * FROM tasks");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tasks",
      error: error.message,
    });
  }
});

// Get a single task by ID
router.get("/tasks:id", async (req, res) => {
  try {
    const [tasks] = await db.execute("SELECT * FROM tasks WHERE id = ?", [
      req.params.id,
    ]);

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(tasks[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching task",
      error: error.message,
    });
  }
});

// Update a task data
router.put("/tasks:id", async (req, res) => {
  const { title, description, status } = req.body;

  // Validate at least one field is being updated
  if (!title && !description && !status) {
    return res.status(400).json({
      message: "At least one field must be updated",
    });
  }

  try {
    // Build dynamic update query
    const updateFields = [];
    const params = [];

    if (title) {
      updateFields.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      params.push(description);
    }
    if (status) {
      updateFields.push("status = ?");
      params.push(status);
    }

    params.push(req.params.id);

    const query = `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ?`;

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating task",
      error: error.message,
    });
  }
});

// Delete a task
router.delete("/tasks/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    console.log("result", result);

    // if (result.affectedRows === 0) {
    //   return res.status(404).json({ message: "Task not found" });
    // }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting task",
      error: error.message,
    });
  }
});

module.exports = router;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Fetching the  tasks when components mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // GET API - Fetch all tasks data
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks");
    }
  };

  // POST API - Create new task datas
  const handleTaskSubmit = async () => {
    if (!currentTask.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      if (editingIndex !== null) {
        // UPDATE API - Edit existing task data
        await axios.put(
          `http://localhost:5000/api/auth/tasks${tasks[editingIndex].id}`,
          {
            title: currentTask.title,
            description: currentTask.description,
            status: currentTask.status,
          }
        );
      } else {
        // CREATE API - Add new task data
        await axios.post("http://localhost:5000/api/auth/tasks", {
          title: currentTask.title,
          description: currentTask.description,
          status: currentTask.status,
        });
      }

      // Refresh tasks after submiting the form
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting task:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create/update task. Check console for details."
      );
    }
  };

  // DELETE API - Remove a task data
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete && taskId) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/tasks/${taskId}`);
        fetchTasks(); // Refresh tasks after deletion of a task
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(error.response?.data?.message || "Failed to delete task");
      }
    }
  };

  // update the task data
  const handleEditTask = (index) => {
    const taskToEdit = tasks[index];
    setCurrentTask(taskToEdit);
    setEditingIndex(index);
    setOpenModal(true);
  };

  // Logout the user
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Open the modal to add new task
  const handleOpenModal = () => {
    setOpenModal(true);
    setCurrentTask({
      title: "",
      description: "",
      status: "pending",
    });
    setEditingIndex(null);
  };

  // Close the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={5}
        p={3}
        boxShadow={3}
        borderRadius={2}
        width={500}
      >
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.full_name || "User"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Email: {user?.email}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          style={{ marginTop: "1rem", marginBottom: "1rem" }}
        >
          Add Task
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={task.id || index}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <Typography
                      color={task.status === "completed" ? "green" : "orange"}
                    >
                      {task.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditTask(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          style={{ marginTop: "1rem" }}
        >
          Logout
        </Button>
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="task-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="task-modal-title" variant="h6" component="h2">
            {editingIndex !== null ? "Edit Task" : "Add New Task"}
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={currentTask.title}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, title: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={currentTask.description}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={currentTask.status}
            onChange={(e) =>
              setCurrentTask({ ...currentTask, status: e.target.value })
            }
            margin="normal"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTaskSubmit}
            >
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

export default Dashboard;

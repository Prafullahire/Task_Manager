import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "@mui/material";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./Dashboard";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";


function App() {
  return (
    <Router>
      <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
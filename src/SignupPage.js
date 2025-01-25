import React, { useState } from "react";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    console.log('Signup form submitted');
    e.preventDefault();
    setError('');

    try {
      // Send signup request to server
        await axios.post('http://localhost:5000/api/auth/signup', {
            full_name: fullName,
            email,
            password
        });
        
        // Redirect to login after successful signup
        navigate('/', { 
            state: { 
                successMessage: 'Account created successfully. Please login.' 
            } 
        });
    } catch (error) {
        //  error handling
        if (error.response && error.response.data) {
            // Server returned a specific error
            setError(error.response.data.message || 'Signup failed');
            console.log(error.response.data);
        } else {
            // Network error or other issues
            setError('Unable to connect to the server. Please try again.');
        }
    }
};

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
    >
      <Box
        sx={{
          boxShadow: 3,
          p: 3,
          borderRadius: 2,
          width: '100%'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" style={{ width: '100%', marginBottom: '1rem' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSignup} width="100%">
          <TextField 
            label="Full Name" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField 
            label="Email" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ 
              minLength: 6 
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Sign Up
          </Button>
        </Box>
        <Typography
          variant="body2"
          style={{ marginTop: "1rem", textAlign: "center" }}
        >
          Already have an account? <Link to="/">Login</Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default SignupPage;
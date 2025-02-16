import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import EventDashboard from './components/EventDashboard';
import EventForm from './components/EventForm';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddEvent = (newEvent) => {
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setIsFormOpen(false);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Event Dashboard
            </Typography>
            <Button color="inherit" onClick={() => setIsFormOpen(true)}>
              Add Event
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <EventDashboard events={events} onDeleteEvent={handleDeleteEvent} />
          <EventForm open={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleAddEvent} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

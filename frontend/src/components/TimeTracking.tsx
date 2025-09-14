import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Add, 
  Delete, 
  AccessTime,
  TimerOff,
  Timer,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { auth } from '../firebase';
import { 
  format, 
  parseISO, 
  differenceInMinutes,
  differenceInSeconds,
  formatDuration, 
  intervalToDuration,
  addHours,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth
} from 'date-fns';

interface TimeEntry {
  id: string;
  task_name: string;
  description?: string;
  project_id?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number;
  is_billable: boolean;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TimeSummary {
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  projects: Array<{project_id: string, hours: number}>;
}

const LOCAL_STORAGE_KEY = 'trackflow_time_entries';

const TimeTracking: React.FC = () => {
  // State management
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry>>({
    task_name: '',
    description: '',
    is_billable: true,
    tags: [],
    start_time: '',
    end_time: null,
    user_id: auth.currentUser?.uid || 'local-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_minutes: 0
  });

  // Update current time every second for the live timer and calculate duration
  useEffect(() => {
    if (isTracking && currentEntry.start_time) {
      const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now);
        if (currentEntry.start_time) {
          const start = new Date(currentEntry.start_time);
          setCurrentDuration(Math.floor((now.getTime() - start.getTime()) / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTracking, currentEntry.start_time]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentDuration, setCurrentDuration] = useState(0);
  
  const [summary, setSummary] = useState<TimeSummary>({
    total_hours: 0,
    billable_hours: 0,
    non_billable_hours: 0,
    projects: []
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    updateSummary(entries);
  }, [entries]);

  const updateSummary = useCallback((timeEntries: TimeEntry[]): void => {
    const now = new Date();
    const filteredEntries = timeEntries.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.start_time);
      switch (dateRange) {
        case 'today': return isToday(entryDate);
        case 'yesterday': return isYesterday(entryDate);
        case 'week': return isThisWeek(entryDate);
        case 'month': return isThisMonth(entryDate);
        case 'custom': 
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          return entryDate >= start && entryDate <= end;
        default: return true;
      }
    });

    const totalMinutes = filteredEntries.reduce((sum: number, entry: TimeEntry) => {
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : now;
      return sum + differenceInMinutes(end, start);
    }, 0);

    const billableMinutes = filteredEntries
      .filter((entry: TimeEntry) => entry.is_billable)
      .reduce((sum: number, entry: TimeEntry) => {
        const start = new Date(entry.start_time);
        const end = entry.end_time ? new Date(entry.end_time) : now;
        return sum + differenceInMinutes(end, start);
      }, 0);

    setSummary({
      total_hours: parseFloat((totalMinutes / 60).toFixed(2)),
      billable_hours: parseFloat((billableMinutes / 60).toFixed(2)),
      non_billable_hours: parseFloat(((totalMinutes - billableMinutes) / 60).toFixed(2)),
      projects: []
    });
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range);
  };

  const formatDurationDisplay = (duration: number | string, end?: string | null): string => {
    let totalSeconds: number;
    
    if (typeof duration === 'number') {
      // Handle duration in seconds
      totalSeconds = duration;
    } else if (end) {
      // Handle start/end time strings (legacy format)
      const startTime = new Date(duration);
      const endTime = new Date(end);
      totalSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    } else if (isTracking && currentEntry.start_time) {
      // Handle active tracking case
      const startTime = new Date(currentEntry.start_time);
      const now = new Date();
      totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    } else {
      // Default case
      return '00:00:00';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Load entries on component mount
  useEffect(() => {
    const loadEntries = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedEntries) {
          const parsedEntries: TimeEntry[] = JSON.parse(savedEntries);
          setEntries(parsedEntries);
        }
      } catch (error) {
        console.error('Error loading time entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries().catch(console.error);
  }, []);

  const handleStartTracking = (): void => {
    const startTime = new Date().toISOString();
    setCurrentEntry((prev: Partial<TimeEntry>) => ({
      ...prev,
      id: Date.now().toString(),
      start_time: startTime,
      end_time: null,
      duration_minutes: 0,
      task_name: prev.task_name || 'Untitled',
      is_billable: prev.is_billable ?? true,
      created_at: prev.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    setIsTracking(true);
    setCurrentTime(new Date());
  };

  const handleStopTracking = async () => {
    const endTime = new Date().toISOString();
    const startTime = currentEntry.start_time ? new Date(currentEntry.start_time) : new Date();
    const durationMinutes = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 60000);
    
    const entryToSave: TimeEntry = {
      ...currentEntry as TimeEntry,
      end_time: endTime,
      duration_minutes: durationMinutes,
      updated_at: new Date().toISOString()
    };
    
    try {
      // Save to localStorage
      const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
      const entries = savedEntries ? JSON.parse(savedEntries) : [];
      const updatedEntries = [...entries, entryToSave];
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      updateSummary(updatedEntries);
      
    } catch (error) {
      console.error('Error saving time entry:', error);
      alert('Failed to save time entry. Please try again.');
    } finally {
      setIsTracking(false);
      setCurrentEntry({
        task_name: '',
        description: '',
        is_billable: true,
        tags: [],
        start_time: '',
        end_time: null,
        user_id: auth.currentUser?.uid || 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        duration_minutes: 0
      });
    }
  };

  const handleDeleteEntry = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      setEntries((prev: TimeEntry[]) => prev.filter((entry: TimeEntry) => entry.id !== id));
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTime sx={{ verticalAlign: 'middle', mr: 1 }} />
          Time Tracking
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Entry
        </Button>
      </Box>

      {/* Time Tracking Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Track Time</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Task Name"
              value={currentEntry.task_name}
              onChange={(e) => setCurrentEntry({...currentEntry, task_name: e.target.value})}
              disabled={isTracking}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentEntry.is_billable}
                  onChange={(e) => setCurrentEntry({...currentEntry, is_billable: e.target.checked})}
                  color="primary"
                  disabled={isTracking}
                />
              }
              label="Billable"
              labelPlacement="start"
              sx={{ mr: 0 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={8}>
            {isTracking ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" color="primary" sx={{ mr: 2 }}>
                  {formatDurationDisplay(currentDuration)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started at {format(new Date(currentEntry.start_time || new Date()), 'h:mm a')}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Ready to track your time?
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            {!isTracking ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={handleStartTracking}
                disabled={!currentEntry.task_name?.trim()}
                fullWidth={isMobile}
                size="large"
              >
                Start Tracking
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Stop />}
                onClick={handleStopTracking}
                fullWidth={isMobile}
                size="large"
              >
                Stop Tracking
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Time Entries */}
      <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h6">
            Recent Entries
          </Typography>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant={dateRange === 'today' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateRangeChange('today')}
            >
              Today
            </Button>
            <Button
              variant={dateRange === 'yesterday' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateRangeChange('yesterday')}
            >
              Yesterday
            </Button>
            <Button
              variant={dateRange === 'week' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateRangeChange('week')}
            >
              This Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateRangeChange('month')}
            >
              This Month
            </Button>
            <Button
              variant={dateRange === 'custom' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateRangeChange('custom')}
              endIcon={<Edit fontSize="small" />}
            >
              Custom
            </Button>
          </Box>
        </Box>
        
        {dateRange === 'custom' && (
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              label="Start Date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              sx={{ width: 150 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        )}
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No time entries found. Start tracking your time!
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(parseISO(entry.start_time), 'MMM d')}</TableCell>
                      <TableCell>{entry.task_name || 'Untitled'}</TableCell>
                      <TableCell>{entry.project_id || 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(entry.start_time), 'h:mm a')}</TableCell>
                      <TableCell>{
                        entry.end_time 
                          ? format(parseISO(entry.end_time), 'h:mm a') 
                          : 'In Progress'
                      }</TableCell>
                      <TableCell>
                        {formatDurationDisplay(entry.start_time, entry.end_time)}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteEntry(entry.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Time Entry Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingId(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name"
                value={currentEntry.task_name || ''}
                onChange={(e) => setCurrentEntry({...currentEntry, task_name: e.target.value})}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={currentEntry.description || ''}
                onChange={(e) => setCurrentEntry({...currentEntry, description: e.target.value})}
                multiline
                rows={2}
                placeholder="Add any additional notes..."
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={currentEntry.project_id || ''}
                  onChange={(e) => setCurrentEntry({...currentEntry, project_id: e.target.value as string})}
                  label="Project"
                >
                  <MenuItem value="project1">Project 1</MenuItem>
                  <MenuItem value="project2">Project 2</MenuItem>
                  <MenuItem value="project3">Project 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentEntry.is_billable ?? true}
                    onChange={(e) => setCurrentEntry({...currentEntry, is_billable: e.target.checked})}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" color={currentEntry.is_billable ? 'primary' : 'textSecondary'}>
                      {currentEntry.is_billable ? 'Billable' : 'Non-billable'}
                    </Typography>
                  </Box>
                }
                labelPlacement="start"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={currentEntry.start_time ? 
                  format(parseISO(currentEntry.start_time), "yyyy-MM-dd'T'HH:mm") : 
                  ''
                }
                onChange={(e) => setCurrentEntry({...currentEntry, start_time: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={currentEntry.end_time ? 
                  format(parseISO(currentEntry.end_time), "yyyy-MM-dd'T'HH:mm") : 
                  ''
                }
                onChange={(e) => setCurrentEntry({...currentEntry, end_time: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={async () => {
              try {
                // Create a complete entry with all required fields
                const entryToSave: TimeEntry = {
                  ...currentEntry as TimeEntry,
                  id: editingId || Date.now().toString(),
                  task_name: currentEntry.task_name || 'Untitled Task',
                  description: currentEntry.description || '',
                  is_billable: currentEntry.is_billable ?? true,
                  tags: currentEntry.tags || [],
                  user_id: auth.currentUser?.uid || 'local-user',
                  created_at: currentEntry.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  start_time: currentEntry.start_time || new Date().toISOString(),
                  end_time: currentEntry.end_time || null,
                  duration_minutes: currentEntry.duration_minutes || 0,
                  project_id: currentEntry.project_id || null
                };

                // Get existing entries
                const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
                let entries = savedEntries ? JSON.parse(savedEntries) : [];

                if (editingId) {
                  // Update existing entry
                  entries = entries.map((entry: TimeEntry) => 
                    entry.id === editingId ? entryToSave : entry
                  );
                } else {
                  // Add new entry
                  entries = [...entries, entryToSave];
                }

                // Save to localStorage
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
                setEntries(entries);
                setOpenDialog(false);
                setEditingId(null);
                setCurrentEntry({
                  task_name: '',
                  description: '',
                  is_billable: true,
                  tags: []
                });
                
                // Update the summary
                updateSummary(entries);
              } catch (error) {
                console.error('Error saving time entry:', error);
                // Show error to user
                alert('Failed to save time entry. Please try again.');
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTracking;

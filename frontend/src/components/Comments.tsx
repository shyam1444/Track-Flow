import React, { useEffect, useRef, useState } from 'react';
import {
  Paper,
  Avatar,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

// Define the shape of a comment object
interface Comment {
  id: string;
  entityId: string;
  entityType: string;
  author: string;
  content: string;
  created_at: string;
}

// Props for the Comments component
interface CommentsProps {
  entityId: string;      // ID of the entity (lead, order, etc.)
  entityType: string;    // Type of the entity (e.g., 'lead', 'order')
  currentUser?: string;  // (Optional) Current user's name or ID for authoring comments
}

/**
 * Enhanced Comments component with modern UI/UX and features.
 */
const Comments: React.FC<CommentsProps> = ({ entityId, entityType, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [now, setNow] = useState(new Date());

  // Update 'now' every minute to keep relative times fresh
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch comments from the backend
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/comments?entityId=${entityId}&entityType=${entityType}`);
        if (response.status === 404) {
          setComments([]); // No comments found is not an error
        } else if (!response.ok) {
          setError('Comments are temporarily unavailable.');
        } else {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (err: any) {
        setError('Comments are temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };
    if (entityId && entityType) {
      fetchComments();
    }
  }, [entityId, entityType]);

  // Auto-scroll to top (newest comment)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [comments]);

  // Handle posting a new comment (optimistic UI)
  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    setError(null);
    const optimisticComment: Comment = {
      id: 'temp-' + Date.now(),
      entityId,
      entityType,
      author: currentUser || 'Anonymous',
      content: newComment.trim(),
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          entityType,
          author: currentUser || 'Anonymous',
          content: optimisticComment.content,
        }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      const savedComment = await response.json();
      setComments((prev) => [savedComment, ...prev.filter(c => c.id !== optimisticComment.id)]);
    } catch (err: any) {
      setError(err.message || 'Error posting comment');
      setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
    } finally {
      setPosting(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to post
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handlePostComment();
    }
  };

  // Delete comment logic
  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!deletingId) return;
    setError(null);
    setDeleteDialogOpen(false);
    const idToDelete = deletingId;
    setDeletingId(null);
    // Optimistic UI
    const prevComments = comments;
    setComments((prev) => prev.filter(c => c.id !== idToDelete));
    try {
      const response = await fetch(`/api/comments/${idToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete comment');
    } catch (err: any) {
      setError(err.message || 'Error deleting comment');
      setComments(prevComments); // Rollback
    }
  };

  // Edit comment logic
  const startEdit = (id: string, content: string) => {
    setEditId(id);
    setEditContent(content);
    setEditError(null);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditContent('');
    setEditError(null);
  };
  const saveEdit = async () => {
    if (!editId || !editContent.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const response = await fetch(`/api/comments/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!response.ok) throw new Error('Failed to edit comment');
      setComments((prev) => prev.map(c => c.id === editId ? { ...c, content: editContent } : c));
      cancelEdit();
    } catch (err: any) {
      setEditError(err.message || 'Error editing comment');
    } finally {
      setEditLoading(false);
    }
  };

  // Helper: get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 700, margin: '32px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Comments</Typography>
      {/* New Comment Form */}
      <Box component="form" onSubmit={handlePostComment} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Avatar sx={{ alignSelf: 'flex-start', bgcolor: 'primary.main' }}>
          {currentUser ? getInitials(currentUser) : '?'}
        </Avatar>
        <TextField
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
          disabled={posting}
          variant="outlined"
          inputProps={{ 'aria-label': 'Add a comment' }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          disabled={posting || !newComment.trim()}
          sx={{ minWidth: 120 }}
        >
          {posting ? <CircularProgress size={20} /> : 'Post'}
        </Button>
      </Box>
      {/* Show error only for user-actionable errors, not for fetch errors */}
      {error && !loading && error !== 'Comments are temporarily unavailable.' && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {/* Show friendly fetch error above the comment box */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Typography align="center" color="primary" sx={{ mt: 2, fontWeight: 500 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <List ref={listRef} sx={{ maxHeight: 400, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          {comments.map((comment) => (
            <ListItem alignItems="flex-start" key={comment.id} sx={{ borderRadius: 3, mb: 2, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px 0 rgba(79,140,255,0.06)' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#7dd3fc' }}>{comment.author?.[0]?.toUpperCase() || '?'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{comment.author || 'Anonymous'}</Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {comment.created_at ? `about ${formatDistanceToNowStrict(parseISO(comment.created_at), { addSuffix: true, roundingMethod: 'floor', })}` : ''}
                    </Typography>
                  </Box>
                }
                secondary={comment.content}
              />
            </ListItem>
          ))}
        </List>
      )}
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this comment? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Comments; 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'your_mongodb_atlas_connection_string_here', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor'], required: true },
  subjects: [String],
  bio: String,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Session Schema
const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: String,
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'completed', 'cancelled'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', SessionSchema);

// Review Schema
const ReviewSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, subjects, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, subjects, bio });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
app.get('/api/me', auth, async (req, res) => {
  res.json(req.user);
});

// Get all tutors
app.get('/api/tutors', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create session (tutor only)
app.post('/api/sessions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') throw new Error('Only tutors can create sessions');
    const session = new Session({ ...req.body, tutor: req.user._id });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all available sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'available' }).populate('tutor', '-password');
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's sessions
app.get('/api/my-sessions', auth, async (req, res) => {
  try {
    const query = req.user.role === 'tutor' 
      ? { tutor: req.user._id } 
      : { student: req.user._id };
    const sessions = await Session.find(query)
      .populate('tutor', '-password')
      .populate('student', '-password');
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Book session (student only)
app.post('/api/sessions/:id/book', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') throw new Error('Only students can book sessions');
    const session = await Session.findById(req.params.id);
    if (!session || session.status !== 'available') throw new Error('Session not available');
    session.student = req.user._id;
    session.status = 'booked';
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit review (student only)
app.post('/api/reviews', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') throw new Error('Only students can submit reviews');
    const { sessionId, rating, comment } = req.body;
    const session = await Session.findById(sessionId);
    if (!session || session.student.toString() !== req.user._id.toString()) {
      throw new Error('Invalid session');
    }
    const review = new Review({
      session: sessionId,
      tutor: session.tutor,
      student: req.user._id,
      rating,
      comment
    });
    await review.save();
    
    // Update tutor rating
    const tutor = await User.findById(session.tutor);
    const totalRating = tutor.rating * tutor.totalReviews + rating;
    tutor.totalReviews += 1;
    tutor.rating = totalRating / tutor.totalReviews;
    await tutor.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get reviews for a tutor
app.get('/api/tutors/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ tutor: req.params.id })
      .populate('student', 'name')
      .populate('session', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
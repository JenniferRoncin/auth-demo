const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({
    username: req.body.username,
    password: hashedPassword
  });
  newUser.save((err) => {
    if (err) {
      res.send('Error registering user');
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (validPassword) {
      req.session.userId = user._id;
      res.redirect('/');
    } else {
      res.send('Invalid password');
    }
  } else {
    res.send('User not found');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

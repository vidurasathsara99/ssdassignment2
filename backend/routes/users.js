var express = require('express');
var router = express.Router();
const router1 = express();

const fileUpload = require('express-fileupload');

const passport = require('passport');
const User = require('../models/user');

router1.use(fileUpload());

router.get('/most-liked', async function(req, res, next) {

  // handle authentication manually, as we want the API to work in both cases,
  // but to return 'liked' property if logged in
  passport.authenticate('jwt', async function(err, user, info) {
    var match = {}
    if (user) {
      match = {liker: user.id};
    }
    const users = await User.find(
    ).populate({path:'liked', match: match}).populate({path:'likes'}).sort({'likes': -1});
    res.status(200).json(users);
  })(req, res, next);

});

router.get('/user/:username', async function(req, res, next) {
  const user = await User.findOne({username: req.params.username}).populate('likes');
  res.status(200).json(user);
});

router1.post('/upload', passport.authenticate('jwt', {session: false}), async function(req, res) {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

module.exports = router1;

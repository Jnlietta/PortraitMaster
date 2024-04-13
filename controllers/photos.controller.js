const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExt = file.path.split('.').slice(-1)[0]; // cut only file extension from full path, e.g. C:/test/abc.jpg -> jpg
    const allowedExtensions = ['gif', 'jpg', 'png'];
    const correctExtension = allowedExtensions.includes(fileExt);

    const patternOne = new RegExp(/^[A-Za-z0-9\s\-_,\.;:()]+$/, 'g');
    const patternTwo = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'g');
    const titleMatched = title.match(patternOne).join('');
    const authorMatched = author.match(patternOne).join('');
    const emailMatched = email.match(patternTwo).join('');

    if(titleMatched.length < title.length && 
      authorMatched.length < author.length &&
      emailMatched.length < email.length
    ) throw new Error('Invalid characters...');

    if(title && 
      author && 
      email && 
      file && 
      correctExtension &&
      title.length <= 25 &&
      author.length <= 50
    ) { // if fields are not empty ad file name have correct extension...

      const newPhoto = new Photo({ title: title, author: author, email: email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
 const { remoteAddress } = req.socket;
 const { id } = req.params;

  try {
    let voter = await Voter.findOne({ user: remoteAddress });

    if(!voter){
      //if voter don't exist in db yet add this voter 
      voter = new Voter({ user: remoteAddress, votes: [id] });
      voter.save();
    } else {
      // if voter exist already in db check if voter voted on this picture
      if(!voter.votes.includes(id)){
        // if voter hasn't vote yet on the picture add photo id value
        voter.votes.push(id);
        voter.save();

        const photoToUpdate = await Photo.findOne({ _id: req.params.id });
        if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
        else {
          photoToUpdate.votes++;
          photoToUpdate.save();
          res.send({ message: 'OK' });
        }
      } else {
        //if voter already voted return response with error
        throw new Error('User already voted for this photo.');
      }
    }

  } catch(err) {
    res.status(500).json(err);
  }
};

/****** DELETE PHOTO OF AUTHOR ********/

exports.deleteByAuthor = async (req, res) => {
  try {
    const authorName = req.params.authorName; 

    // Remove all data from authorName
    const result = await Photo.deleteMany({ author: authorName });

    if (result.deletedCount > 0) {
      res.json({ message: `All photos of this author have been deleted ${authorName}` });
    } else {
      res.json({ message: `Can't find any pictures of  ${authorName}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
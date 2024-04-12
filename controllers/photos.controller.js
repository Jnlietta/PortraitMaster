const Photo = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExt = file.path.split('.').slice(-1)[0]; // cut only file extension from full path, e.g. C:/test/abc.jpg -> jpg
    const allowedExtensions = ['gif', 'jpg', 'png'];

    if(title && author && email && file && allowedExtensions.includes(fileExt)) { // if fields are not empty ad file name have correct extension...

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

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
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
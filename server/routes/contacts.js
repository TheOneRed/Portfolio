//contact.js
//Jeffrey Li
//https://comp308-assignment2-jeffreyli.herokuapp.com
//How to get to pages and pass info to db
// modules required for routing
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let passport = require('passport');

// define the user model
let UserModel = require('../models/users');
let User = UserModel.User; // alias for User Model - User object

// define the game model
let contact = require('../models/contacts');

// create a function to check if the user is authenticated
function requireAuth(req, res, next) {
  // check if the user is logged in
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
}

/* GET contacts List page. READ */
router.get('/', requireAuth, (req, res, next) => {
  // find all contacts in the games collection
  contact.find((err, contacts) => {
    if (err) {
      return console.error(err);
    }
    else {
      contacts.sort(function (a, b) {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
      res.render('contacts/index', {
        title: 'Contacts',
        contacts: contacts,
        displayName: req.user.displayName
      });
    }
  });

});

//  GET the Contacts Details page in order to add a new Contact
router.get('/add', requireAuth, (req, res, next) => {
  res.render('contacts/details', {
    title: "Add a new Contact",
    contacts: '',
    displayName: req.user.displayName
  });
});

// POST process the Contact Details page and create a new Contacts - CREATE
router.post('/add', requireAuth, (req, res, next) => {

  let newContact = contact({
    "name": req.body.name,
    "phone": req.body.phone,
    "email": req.body.email
  });

  contact.create(newContact, (err, contact) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.redirect('/contacts');
    }
  });
});

// GET the Contact Details page in order to edit a new Contact
router.get('/:id', requireAuth, (req, res, next) => {

  try {
    // get a reference to the id from the url
    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    // find one contact by its id
    contact.findById(id, (err, contacts) => {
      if (err) {
        console.log(err);
        res.end(error);
      } else {
        // show the contacts details view
        res.render('contacts/details', {
          title: 'Contact Details',
          contacts: contacts,
          displayName: req.user.displayName
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.redirect('/errors/404');
  }
});

// POST - process the information passed from the details form and update the document
router.post('/:id', requireAuth, (req, res, next) => {
  // get a reference to the id from the url
  let id = req.params.id;

  let updatedContact = contact({
    "_id": id,
    "name": req.body.name,
    "phone": req.body.phone,
    "email": req.body.email
  });

  contact.update({ _id: id }, updatedContact, (err) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      // refresh the contacts List
      res.redirect('/contacts');
    }
  });

});

// GET - process the delete by user id
router.get('/delete/:id', requireAuth, (req, res, next) => {
  // get a reference to the id from the url
  let id = req.params.id;

  contact.remove({ _id: id }, (err) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      // refresh the games list
      res.redirect('/contacts');
    }
  });
});


module.exports = router;

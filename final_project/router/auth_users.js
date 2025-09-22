const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    return (username in users)
}

const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  username = req.body.username
  password = req.body.password
  console.log("users: " + users)
  console.log("username: " + username + " password: " + password)

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }


  if(authenticatedUser(username, password)){
    //create jwt
    let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn
  let review = req.body.review
  let username = req.session.authorization?.username;
  console.log("isbn: " + isbn + " review: " + review + "username" + username)
  books[isbn].reviews[username] = review
  res.send("review added")
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn
    let username = req.session.authorization?.username;
    delete books[isbn].reviews[username]
    res.send("review deleted")
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

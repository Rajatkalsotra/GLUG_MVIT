var express=require("express"),
router	   =express.Router(),
firebase  			 = require("firebase");

var db=firebase.database();
var ref;
// HOME
router.get("/",function(req,res){
	res.render("home");
});
// TEAM
router.get("/author",function(req,res){
  res.render("author");
});
// EVENTS
router.get("/events",function(req,res){
  res.render("events");
});
// NEW EVENT FORM
router.get("/new",function(req,res){
  res.render("new");
});
// CREATE EVENT
router.post("/new",function(req,res){
  ref = db.ref("/events");
  ref.once('value', function(snapshot) {
    n=snapshot.numChildren(); 
    n=n+1;
    firebase.database().ref('events/'+n).set(req.body.event);
  });
});
// EDIT
router.get("/events/:id/edit",function(req,res){
  res.render("edit");
})
// UPDATE EVENT
router.put("/events/:i",function(req,res){
  db.ref('/events/'+req.params.i).update(data);
})
// DELETE EVENT
router.delete("/events/:i",function(req,res){
  ref = db.ref("/events/"+req.params.i);
  ref.remove();
})
// LOGIN PAGE
router.get("/login",function(req,res){
  res.render("login");
});
// LOGGING IN
router.post("/login",function(req,res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
  .then(function(userRecord){
    console.log(firebase.auth().currentUser);
    res.redirect("/");
  })
 .catch(function(err) {
  console.log(err);
 });
})

// SIGN UP
router.get("/register",function(req,res){
  res.render("register");
});
// CREATE NEW USER
router.post("/register",function(req,res){
  firebase.auth().createUserWithEmailAndPassword(req.body.email,req.body.password)
   .then(function(userRecord) {
    console.log('Successfully created new user:', userRecord.uid);
  })
  .catch(function(err){
    console.log(error.code);
    console.log(error.message);
  })
})

module.exports=router;
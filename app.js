var express        	 =require("express"),
app       			 =express(),
bodyParser 			 =require("body-parser"),
firebase  			 = require("firebase"),
methodOverride   =require("method-override"),
flash          =require("connect-flash");

var config = {
  // FIREBASE CONFIGURATION
};

firebase.initializeApp(config);
var db = firebase.database();

app.use(flash());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(require("express-session")({
  secret:"Jai hind",
  resave:false,
  saveUniniatialized:false
}));


app.use(function(req,res,next){
	res.locals.user=firebase.auth().currentUser;
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
	next();
});
var ref;
// HOME
app.get("/",function(req,res){
	res.render("home");
});
// TEAM
app.get("/author",function(req,res){
  res.render("author");
});
// EVENTS
app.get("/events",function(req,res){
  ref=db.ref('/events/');
   var events=[];
  ref.once('value',function(snapshot){
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();   
      events.push(childData);
    });
     res.render("events",{events:events});
  })
 
});
// NEW EVENT FORM
app.get("/new",isLoggedIn,function(req,res){
  res.render("new");
});
// CREATE EVENT
app.post("/new",isLoggedIn,function(req,res){
  var id = db.ref().child('events').push().key;
  var event=req.body.event;
  event.id=id;
  event.author=firebase.auth().currentUser.email;
  var updates = {};
  updates['/events/' + id] = event;
  db.ref().update(updates); 
  console.log(event);
  res.redirect("/events");
});
// EDIT
app.get("/events/:id/edit",isOwner,function(req,res){
  ref=db.ref('/events/'+req.params.id);
  ref.once('value',function(snapshot){
    var event=snapshot.val();
    console.log(event);
    res.render("edit",{event:event});
  })
  
})
// UPDATE EVENT
app.put("/events/:id",isOwner,function(req,res){
  ref=db.ref('/events/'+req.params.id);
   var event=req.body.event;
   event.id=req.params.id;
    
    db.ref('/events/'+req.params.id).set(event);
    res.redirect('/events');
})
// DELETE EVENT
app.delete("/events/:id/delete",isOwner,function(req,res){
  ref = db.ref("/events/"+req.params.id);
  ref.remove();
  res.redirect("/events");
})
// APPLY
app.get("/events/:id/apply",function(req,res){
  ref=db.ref('/events/'+req.params.id);
  ref.once('value',function(snapshot){
    var event=snapshot.val();
    console.log(event);
    res.render("apply",{event:event});
  })
})
app.post("/events/:id",function(req,res){
  var pid = db.ref('/events/:id').push().key;
  var participant=req.body.participant;
  participant.pid=pid;
  var updates = {};
  updates['/events/' + req.params.id+'/participants/'+pid] = participant;
  db.ref().update(updates); 
  if(participant){
    req.flash("success","Successfully applied!!");
  }
  else{
    req.flash("error","Something went wrong!!");
  }

  res.redirect("/events");
})
// LOGIN PAGE
app.get("/login",function(req,res){
  res.render("login");
});
// LOGGING IN
app.post("/login",function(req,res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
  .then(function(userRecord){
    res.redirect("/");
  })
 .catch(function(err) {
  console.log(err);
  res.redirect("/login");
 });
})

// SIGN UP
app.get("/register",function(req,res){
  res.render("register");
});
// CREATE NEW USER
app.post("/register",function(req,res){
  firebase.auth().createUserWithEmailAndPassword(req.body.email,req.body.password)
   .then(function(userRecord) {
    res.redirect("/");
  })
  .catch(function(err){
    console.log(error.code);
    console.log(error.message);
        res.redirect("/register")

  })
});
// LOGOUT
app.get("/logout",function(req,res){
  firebase.auth().signOut().then(function() {
    res.redirect("/");
  }, function(error) {
    console.log(error);
     res.redirect("/");
  });
})
// MIDDLEWARE
function isLoggedIn(req, res, next) {
      var user = firebase.auth().currentUser;
      if (user !== null) {
        req.user = user;
        next();
      } else {
        res.redirect('/login');
      }
}

function isOwner(req,res,next){
   var user = firebase.auth().currentUser;
      if (user !== null) {
        var ref=db.ref('/events/'+req.params.id);
        ref.once('value',function(snapshot){
          console.log( snapshot.val().email)
          if(firebase.auth().currentUser.email === snapshot.val().author){
            req.user = user;
            next();
          }
          else{
            res.redirect("/events");
          } 
        })
      } 
      else {
        res.redirect('/login');
      }
}
app.listen(process.env.PORT,function(){
	console.log("SERVER STARTED!!!");
});
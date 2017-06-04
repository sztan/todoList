console.log('start0');

var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public')); // for css for example

function undo(type, id, content) {
  this.id=id;
  this.type=type;
  this.content=content;
}

function retrieve(){
}

undo.prototype.retrieve=retrieve;
var isUndo=false;

/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))


.use(function(req, res, next){
    if (typeof(req.session.todolist) == 'undefined') {
        req.session.todolist = [];
    }
    if (typeof(req.session.todolistUndo) == 'undefined') {
        req.session.todolistUndo = [];
    }
    next();
})

/* Gestion des routes en-dessous
   ....                         */
.get('/todo', function(req, res) {
  res.render('tasks',{todolist: req.session.todolist});
    console.log(req.session.todolistUndo);
})
// ...

.post('/todo/add', urlencodedParser, function(req, res) {
  if (req.body.newtodo != '') {
    req.session.todolist.push(req.body.newtodo);
  }
  res.redirect('/todo');
})

.get('/todo/remove/:taskId', function(req, res) {
  taskId=req.params.taskId;
  if (taskId != '') {
    //gestion de l'undo
    myundo=new undo("delete",taskId,req.session.todolist[taskId]);
    req.session.todolistUndo.push(myundo);
    //
    req.session.todolist.splice(taskId,1);
  }
  res.redirect('/todo');
})


.get('/todo/undo', function (req, res) {
  if (req.session.todolistUndo.length>0) {
    var lastEl=req.session.todolistUndo.length-1;
    var type=req.session.todolistUndo[lastEl].type;
    var content=req.session.todolistUndo[lastEl].content;
    var id=req.session.todolistUndo[lastEl].id;
    switch(type){
      case "delete":
        //restore as last El
        req.session.todolist.push(req.session.todolistUndo.splice(lastEl,1)[0].content);
        //use rearrange !
        isUndo=true;
        res.redirect('/todo/rearrange/'+(req.session.todolist.length-1)+'/'+id);
      break;
      case "edit":
        req.session.todolist[id]=content;
        req.session.todolistUndo.splice(lastEl,1);
        res.redirect('/todo');
      break;
      case "rearrange":
      //store and delete
        var newOne=req.session.todolistUndo[lastEl].content.two;
        var newTwo=req.session.todolistUndo[lastEl].content.one;
        req.session.todolistUndo.splice(lastEl,1);
        console.log('appel, isUndo='+isUndo);
        isUndo=true;
        res.redirect('/todo/rearrange/'+newOne+'/'+newTwo);
      break;
      default:
      break;
    }
  }
})

.post('/todo/modify/', urlencodedParser, function(req, res) {
  taskId=req.body.taskId;
  savedContent=req.session.todolist[taskId];
  taskContent=req.body.taskContent;
  if (taskId != '' && taskContent != '') {
    //gestion de l'undo
    myundo=new undo("edit",taskId,savedContent);
    req.session.todolistUndo.push(myundo);
    //
    req.session.todolist[taskId]=taskContent;
  }
  res.redirect('/todo');
})

.get('/todo/rearrange/:one/:two', function (req, res) {
  v=req.session.todolist.splice(req.params.one,1);
  req.session.todolist.splice(req.params.two,0,v[0]);
  console.log("rearrange _ _");
  if (!isUndo) {
    console.log("ne provient pas d un undo");
    myundo=new undo("rearrange","",{one: req.params.one, two: req.params.two});
    req.session.todolistUndo.push(myundo);
  }
  isUndo=false;
  res.redirect('/todo');
});

app.listen(8080);

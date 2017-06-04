$(document).ready(function() {
  $(".todoItem").click(function (e) {
      $("input[type='submit'].todoItem").removeClass("visibleSubmit");
      $(".todoItem").removeClass("edited");
    if(!(e.target.type=="submit")) {
      $(this).addClass("edited");
      $(this).nextAll("input[type='submit']").first().addClass("visibleSubmit");
    }
  });
});

var originDiv;
function allowDrop(ev) {
ev.preventDefault();
}

function drag(ev) {
ev.dataTransfer.setData("text", ev.target.id);
ev.dataTransfer.effectAllowed="move";
startY=ev.clientY;
startId=$(ev.target).children("input[type='hidden']").first().val();
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  newForm=document.getElementById(data);
  if(startY<ev.clientY) {
    var direction="toDown";                                     // on descend
    if(ev.target.nodeName=="FORM") {
      $(newForm).insertAfter(ev.target);
      endId=$(ev.target).children("input[type='hidden']").val();
    }
    else {
      $(newForm).insertAfter($(ev.target).closest("form"));
      endId=$(ev.target).closest("form").children("input[type='hidden']").val();
    }
  }
  else {
    var direction="toUp";                                         // on monte
    if(ev.target.nodeName=="FORM") {
      $(newForm).insertBefore(ev.target);
      endId=$(ev.target).children("input[type='hidden']").val();
    }
    else {
      $(newForm).insertBefore($(ev.target).closest("form"));
      endId=$(ev.target).closest("form").children("input[type='hidden']").val();
    }
  }
  rearrange();
}

function rearrange( ) {
 allIds=document.querySelectorAll("input[type='hidden']");
 var i=0;
 allIds.forEach(function(el) {
   $(el).attr("value",i);
   i++;
 });
 httpGetAsync('/todo/rearrange/' + startId +'/' + endId, afficheConsole );
}



function afficheConsole(text) {
 console.log(text);
}

function httpGetAsync(theUrl, callback) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.onreadystatechange = function() {
       if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
           callback(xmlHttp.responseText);
   }
   xmlHttp.open("GET", theUrl, true); // true for asynchronous
   xmlHttp.send(null);
 }

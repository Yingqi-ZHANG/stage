const $ = require('jquery');
// const sparkService = require('./sparkService');
const ciscospark = require('ciscospark');
//const mediaValidator = require('./mediaValidator');
//const outgoingCallTemplate = require('./outgoingCallTemplate');
//const incomingCallTemplate = require('./incomingCallTemplate');

const defaultConstraints = {
  audio: true,
  video: true,
  fake: false
};
const defaultOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};


var spark = ciscospark.init({
  config: {
    credentials: {
      authorizationString: "https://api.ciscospark.com/v1/authorize?client_id=C1de444000a382b286f68e54fd182467de494bd86f4ef7125c151449c39a4c4e5&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Findex.html&scope=spark%3Aall%20spark%3Akms"
    }
  }
});



var teamsId = "";
var roomsId = "";
var currentCall = null;



spark.once(`ready`, function() {
  if (spark.canAuthorize){
    var email="";
    //remove page login
    $('#login-overlay').remove();
    $('#logout-button').css('display','inline');
    //list the teams
    Promise.all([spark.teams.list()])
    .then(function(teams) {
      for (var i = 0; i < teams[0].items.length; i++) {
        var button = "<button class=\"teamService teambutton\" id=\""+teams[0].items[i].id+"\" >"+teams[0].items[i].name+"</button>";
        $("#left").append(button);
      }
      return 'success';
    });

    //list the services of the team selected
    $("#left").on('click',".teamService", function(){
      if(currentCall) {
        alert("Raccrocher");
      }
      else {
        teamsId = $(this).attr("id");
        $('#left').removeClass('focus');
        $('#centre').addClass('focus');
        $('#right').removeClass('focus');
        $('.roombutton').remove();
        Promise.all([spark.rooms.list({teamId:teamsId})])
        .then(function(rooms){
          for (var i = 0; i < rooms[0].items.length; i++) {
            var button = "<button class=\"roomService roombutton\" id=\""+rooms[0].items[i].id+"\" name = \""+rooms[0].items[i].title+"\">"+rooms[0].items[i].title+"</button>";
            $("#centre").append(button);
          }
          return 'success';
        });
      }
    });
    //list the function call message documents
    $("#centre").on('click',".roomService", function(){
      if(currentCall) {
        alert("Raccrocher");
      }
      else {
        roomsId = $(this).attr("id");
        email = trouveFonnctionnaire(roomsId);
        if(""!=email){
          console.log(email);
          $("div#right .title").text($(this).text());
          $('#centre').removeClass('focus');
          $('#right').addClass('focus');
          $('#function').css('display','inline');
        }
        else{
          $("div#right .title").text("Service indisponible");
          //$("div#right .title").text($(this).text());
          $('#centre').removeClass('focus');
          $('#right').addClass('focus');
          $('#function').css('display','inline');
        }
      }
    });
    // make video call

    $("#function").on('click',"#call",function(){
      spark.phone.register();
      const constraints = Object.assign({}, defaultConstraints,{ video: true });
      if(""==email){
        email = $('#user-email').val();
      }
      console.log(email);
      call = spark.phone.dial(email, {
        offerOptions: defaultOfferOptions,
        constraints: constraints
      });
      currentCall = call;
      $('#espaceVideo').append($('#active-call-template').html().trim());
      //Meeting link: https://web.ciscospark.com/meet/cdfac4ab-bdd4-459b-8947-e4039e0c95bb, Video Address: 88271349833@meet.ciscospark.com
      call.on('connected',function(){
        console.log("@2");
        call.off('disconnected error', outgoingCallFailure);
        document.getElementById('incoming-call').srcObject = call.remoteMediaStream;
      });

      call.on('remoteMediaStream:change', function() {
        console.log("@3");
        document.getElementById('incoming-call').srcObject = call.remoteMediaStream;
      });
      call.on('localMediaStream:change', function() {
        document.getElementById('outgoing-call').srcObject = call.localMediaStream;
      });
      call.on('disconnected',() => {hangupCall(call)});
      call.on('error', handleError);

      $('#hangup-call').on('click', () => {hangupCall(call)});
    });


  }
  else {
    $('#left').append($('#login-template').html().trim());
    $('#logout-button').css('display','none');
    $('#login-button').on('click', () => {
      spark.authorization.initiateLogin();
    });
  }
});

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  //$('#calling-status').html(message).css('display', 'inline');
  //$('#hangup-calling').removeClass('red').addClass('wide').text('Home');
  //$('.avatar-image').addClass('failed');
  //$('.loader').addClass('inactive');
}

function handleError(error) {
  console.error('call error: ', error);
}

function hangupCall(call){
  call.hangup();
  currentCall = null;
  console.log("call to hangup");
  $('#active-call-overlay').remove();
}

function trouveFonnctionnaire(roomsId){
  var emaildisponible="";
  Promise.all([spark.memberships.list({roomId:roomsId})])
  .then(function(memberships){
    for (var i = 0; i < memberships[0].items.length; i++) {
      var tempId = memberships[0].items[i].personId;
      spark.people.get({personId:tempId})
      .then(function(people){
        console.log(people);
        if ("active"==people.status) {
          emaildisponible = people.emails[0];
          console.log(people.emails[0]);
        }
      });
      if(""!=emaildisponible) break;
    }
    return 'success';
  })
  return emaildisponible;
}

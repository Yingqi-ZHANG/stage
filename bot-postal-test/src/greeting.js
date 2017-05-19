var request = require("request");
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();
//bot.interpreter.prefix = "#"; // Remove comment to overlad default / prefix to identify bot commands

var SparkAPIWrapper = require("node-sparkclient");
if (!process.env.SPARK_TOKEN) {
  console.log("Could not start as this bot requires a Cisco Spark API access token.");
  process.exit(1);
}
var spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);

bot.onMessage(function (trigger, message) {
  console.log("new message from: " + trigger.data.personEmail + ", text: " + message.text);
  var command = bot.asCommand(message);
  if (command) {
    if("suivi"==command.keyword){
      var nb = command.args[0];
      var option1 = {
        method: 'GET',
        url: 'https://api.laposte.fr/suivi/v1/'+nb,
        headers:
        { 'cache-control': 'no-cache',
        'content-type': 'application/json',
        'x-okapi-key': 'zchl9IRQIeGObF+kw+s4nD4h+d6pJKqgGMwJtT7KFJs/sGa4p1ljEh8hU1zwNcaV' }
      };

      request(option1, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        spark.createMessage(command.message.roomId, "state:"+JSON.parse(body).message, { "markdown":true }, function(err, response) {
          if (err) {
            console.log("WARNING: could not post Fallback message to room: " + command.message.roomId);
            return;
          }
        });
      });
    }
    if("info"==command.keyword){
      spark.createMessage(command.message.roomId, "1.Type /hello <br/>2. Type /suivi NUMERO_DE_SUIVI(13 caractères) pour suivi", { "markdown":true }, function(err, message) {
        if (err) {
          console.log("WARNING: could not post message to room: " + command.message.roomId);
          return;
        }
      });
    }
    if("hello"==command.keyword){
      var email = command.message.personEmail; // Spark User that created the message orginally
      spark.createMessage(command.message.roomId, "Hello <@personEmail:" + email + ">", { "markdown":true }, function(err, message) {
        if (err) {
          console.log("WARNING: could not post Hello message to room: " + command.message.roomId);
          return;
        }
      });
    }
    console.log("detected command: " + command.keyword + ", with args: " + JSON.stringify(command.args));
  }
  if((!command) && ("BotPostalTest@sparkbot.io"!= message.personEmail)){
    spark.createMessage(message.roomId, "Type /info pour information", { "markdown":true }, function(err, message) {
      if (err) {
        console.log("WARNING: could not post Mention message to room: " + trigger.data.roomId);
        return;
      }
    });
  }
});

//first added into a room or a conversation
bot.onEvent("memberships", "created", function (trigger) {
  var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
  if (newMembership.personId != bot.interpreter.person.id) {
    console.log("new membership fired, but it is not us being added to a room. Ignoring...");
    return;
  }

  console.log("bot's just added to room: " + trigger.data.roomId);

  spark.createMessage(trigger.data.roomId, "Bonjour \n ", { "markdown":true }, function(err, message) {
    if (err) {
      console.log("WARNING: could not post Hello message to room: " + trigger.data.roomId);
      return;
    }

    if (message.roomType == "group") {
      spark.createMessage(trigger.data.roomId, "Type /info pour information", { "markdown":true }, function(err, message) {
        if (err) {
          console.log("WARNING: could not post Mention message to room: " + trigger.data.roomId);
          return;
        }
      });
    }
  });
});


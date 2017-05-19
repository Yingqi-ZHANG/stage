var SparkBot = require("node-sparkbot");
var bot = new SparkBot();
//bot.interpreter.prefix = "#"; // Remove comment to overlad default / prefix to identify bot commands

var SparkAPIWrapper = require("node-sparkclient");
if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    process.exit(1);
}

var spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);

//messages
bot.onMessage(function(trigger,message){
  if("BotPostalTest@sparkbot.io"!=message.personEmail)
    spark.createMessage(message.roomId,message.personEmail+"said:"+message.text, { "markdown":true }, function(err, message) {
      if (err) {
          console.log("WARNING: could not post message to room: " + command.message.roomId);
          return;
      }
    });
});

//command

bot.onCommand("help", function (command) {
    spark.createMessage(command.message.roomId, "Hi, I am the Hello World bot !\n\nType /hello to see me in action.", { "markdown":true }, function(err, message) {
        if (err) {
            console.log("WARNING: could not post message to room: " + command.message.roomId);
            return;
        }
    });
});
bot.onCommand("fallback", function (command) {
    spark.createMessage(command.message.roomId, "Sorry, I did not understand.\n\nTry /help.", { "markdown":true }, function(err, response) {
        if (err) {
            console.log("WARNING: could not post Fallback message to room: " + command.message.roomId);
            return;
        }
    });
});
bot.onCommand("hello", function (command) {
    var email = command.message.personEmail; // Spark User that created the message orginally
    spark.createMessage(command.message.roomId, "Hello <@personEmail:" + email + ">", { "markdown":true }, function(err, message) {
        if (err) {
            console.log("WARNING: could not post Hello message to room: " + command.message.roomId);
            return;
        }
    });
});


//
// greeting, add robot into a room or a conversation.
bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId != bot.interpreter.person.id) {
        console.log("new membership fired, but it is not us being added to a room. Ignoring...");
        return;
    }

    console.log("bot's just added to room: " + trigger.data.roomId);

    spark.createMessage(trigger.data.roomId, "Hi, I am the Hello World bot !\n\nType /hello to see me in action.", { "markdown":true }, function(err, message) {
        if (err) {
            console.log("WARNING: could not post Hello message to room: " + trigger.data.roomId);
            return;
        }

        if (message.roomType == "group") {
            spark.createMessage(trigger.data.roomId, "Type /info for information", { "markdown":true }, function(err, message) {
                if (err) {
                    console.log("WARNING: could not post Mention message to room: " + trigger.data.roomId);
                    return;
                }
            });
        }
    });
});

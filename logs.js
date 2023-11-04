const request = require("request");

function sendLogsDiscord(message, serverIP, email, id, system, version, requests, status){

    var logo = "https://cdn.discordapp.com/attachments/818159438279082005/975394407928971314/checked.png"
    var title = "Ativação do sistema liberada!"
    if(status === false){
        logo = "https://cdn.discordapp.com/attachments/818159438279082005/975398315355156620/x-button.png"
        title = "Ativação do sistema bloqueada"
    }else if(status === "teste"){
        logo = "https://cdn.discordapp.com/attachments/818159438279082005/978461035671482388/teste.png"
        title = "API Recebeu um teste!"
    }else if (status === "Blacklist") {
        logo = "https://cdn-icons-png.flaticon.com/512/2631/2631511.png"
        title = "Ativação do sistema não liberada!"
    }

    const msg = {

        "username": "Vision Protection API",
        "avatar_url": "https://cdn.discordapp.com/icons/1033181499912110122/fdd00b7da539d7d7c4c54658d3d969c2.png?size=2048",
        "content": "",
        "tts": false,
        "embeds": [

          {
            "title": title,
            "color": 9109759,
            "timestamp": "",
            "url": "",
            "author": {
              "name": "Logs API",
              "url": "",
              "icon_url": "https://cdn.discordapp.com/icons/1033181499912110122/fdd00b7da539d7d7c4c54658d3d969c2.png?size=2048"
            },
            "image": {
              "url": ""
            },
            "thumbnail": {
              "url": logo
            },
            "footer": {
              "text": "Vision Codes Protection by: GuhDeveloper",
              "icon_url": "https://cdn.discordapp.com/icons/1033181499912110122/fdd00b7da539d7d7c4c54658d3d969c2.png?size=2048"
            },
            "fields": [
              {
                "name": "Message:",
                "value": message
              },
              {
                "name": "Server IP:",
                "value": serverIP
              },
              {
                "name": "Email:",
                "value": email
              },
              {
                "name": "Discord ID:",
                "value": id
              },
              {
                "name": "System:",
                "value": system
              },
              {
                "name": "Version:",
                "value": version
              },
              {
                "name": "Requests:",
                "value": requests
              }
            ]
          }

        ],

        "components": []
    }

    request.post("https://discord.com/api/webhooks/1145343331145109594/V5G9qrbtehs4qe-LjXWYdVDdQtXsFSXMEeW8DbwT4hgdHGrDul_6W4XD1zYbLNa5dULS", {json: msg}, function(error, response, body){
        if (!error && response.statusCode == 200){
            console.log(body);
        }
    });

}

module.exports = {
    sendDiscordLogs: sendLogsDiscord
};
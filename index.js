const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const accesstoken = process.env.WHATSAPP_TOKEN;
const mytoken = process.env.MY_TOKEN;

app.listen(process.env.PORT || 8000, ()=>{
    console.log("Webhook is listening in 8000");
});

app.get("/webhook", (req, res)=>{
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    console.log(mode + "\n" + challenge + "\n" + token);
    if (mode && token){
        if (mode === "subscribe" && token === mytoken){
            res.status(200).send(challenge);
        }
        else{
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res)=>{
    let body = req.body;

    console.log(JSON.stringify(body, null, 2));

    if (body.object){
        if (body.entry && 
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value &&
            body.entry[0].changes[0].value.metadata &&
            body.entry[0].changes[0].messages
            ){
                let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body.entry[0].changes[0].messages.from;
                let message = body.entry[0].changes[0].messages.text.body;

                axios({
                    method: 'post',
                    url: 'https://graph.facebook.com/v16.0/' + phone_number_id + '/messages' + "?access_token=" + accesstoken,
                    data: { 
                            messaging_product: "whatsapp", 
                            to: from, 
                            type: "text", 
                            text: {
                                body: "Hello from Jagasabarivel!"
                            }
                    },
                    headers: 'Content-Type: application/json'
                  });
                  res.status(200).send("OK");
        }
    }
    else{
        res.status(403).send("Not a valid request");
    }

});

app.get('', (req, res)=>{
    res.status(200).send("OK");
})


const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const accesstoken = process.env.WHATSAPP_TOKEN;
const mytoken = process.env.MY_TOKEN;
const be_url = process.env.BE_URL;
const messenger_token=process.env.MESSENGER_TOKEN;

app.listen(process.env.PORT || 8001, ()=>{
    console.log("Webhook is listening in 8001");
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

    

    if (body.object === "page"){

        let psid = body.entry[0].messaging[0].sender.id;
        let pageid = body.entry[0].messaging[0].recipient.id;
        let message = body.entry[0].messaging[0].message.text;
        console.log(psid + "\n" + pageid + "\n" + message + "\n");

        let waurl = be_url + "/api/v1/webhook/notify";
                axios({
                    method: "POST",
                    url: waurl,
                    data: { 
                        "from":6828243673860990,  //psid
                        "message":message,
                        "to":115449414847143, //pageid
                        "application":"page"
                    },
                });

        res.status(200).send("Success!");
    }
    
    else if (body.object === "whatsapp_business_account"){

        // Status Handle
        if (body.entry[0].changes[0].value.statuses){
            let status = body.entry[0].changes[0].value.statuses[0].status;
            let customer_number = body.entry[0].changes[0].value.statuses[0].recipient_id;
        }

        // Message Delete Handle
        else if (body.entry[0].changes[0].value.messages[0].errors){
            let code = body.entry[0].changes[0].value.messages[0].errors[0].code;
            let details = body.entry[0].changes[0].value.messages[0].errors[0].details;
        }

        // Message Receive
        else if (body.entry && 
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value &&
            body.entry[0].changes[0].value.metadata &&
            body.entry[0].changes[0].value.messages[0]
            ){
                let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body.entry[0].changes[0].value.messages[0].from;
                let message = body.entry[0].changes[0].value.messages[0].text.body;

                

                //let waurl = "https://graph.facebook.com/v16.0/" + phone_number_id + "/messages?access_token=" + accesstoken
                //let waurl = "http://localhost:8080/api/v1/webhook/notify";
                let waurl = be_url + "/api/v1/webhook/notify";
                axios({
                    method: "POST",
                    url: waurl,
                    data: { 
                        "from":from,
                        "message":message,
                        "to":15550167146,
                        "application":"whatsapp"
                    },
                });
                
                // axios({
                //     method: "POST",
                //     url: waurl,
                //     data: { 
                //             messaging_product: "whatsapp", 
                //             to: from, 
                //             type: "text", 
                //             text: {
                //                 body: "Hello from Jagasabarivel!"
                //             }
                //     },
                //     headers: {
                //         "Content-Type": "application/json"
                //     }
                  
                // }).then(res => {
                //     console.log(res.status);
                // });
                res.status(200).send("OK");
        }



        else{
            res.status(403).send("Not a valid request");
        }
    }
    else{
        res.status(403).send("Not a valid request");
    }

});

app.get('', (req, res)=>{
    res.status(200).send("OK");
})


const express = require("express")
const rateLimit = require("express-rate-limit")
const mysql = require("mysql")
const bcrypt = require('bcryptjs');
const {sendDiscordLogs} = require("../logs");

let totoalRequests = 0;

// Mysql //
const mysqlInformations = {
    host: "64.112.126.37",
    user: "ZlqQbZwo",
    password: "zLRI3pq8R79U",
    port: "3306",
    database: "ZlqQbZwo",
    colum: "licence_private"
}

const pool = mysql.createPool({
    host : mysqlInformations.host,
    database : mysqlInformations.database,
    user : mysqlInformations.user,
    password : mysqlInformations.password
})

const limiterRequest = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    
    handler: async (request, response) => {
        
        const {email, key} = request.body[0];
        const call = new LicenceFunctions (email, key);
        const getLicenceEmailResult = await call.getLicenceEmail()

        if (!getLicenceEmailResult) response.status(404).end();

        const getLicenceKey = await call.getLicenceKey(getLicenceEmailResult);
    
        if (!getLicenceKey) response.send("Failed to get licence from key!")
        const getStateProduct = call.getStateProduct(getLicenceKey)

        if (getStateProduct == "Suspenso") {
            sendDiscordLogs( "Nova Blacklist!",  getLicenceKey.ip,  getLicenceKey.email, getLicenceKey.id, getLicenceKey.produto,  "1.0",  totoalRequests,  "Blacklist" )
            response.status(403).end();
  
        }else {
            await call.updateProductState(getLicenceKey)
            response.status(405).end();
        }
    }

})

const servidor = express()
const servidorPort = 3000

servidor.use(express.json());
servidor.use(limiterRequest);

class LicenceFunctions {
    
    constructor(email, key) {
        this.email = email;
        this.key = key;
    }

    async getLicenceEmail() {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.query(
                    "SELECT * FROM ?? WHERE email = ?", 
                    [mysqlInformations.colum, this.email],
                    (error, rows) => {
                        if (error) {
                            console.log("Falha ao tentar se comunicar com o banco de dados!");
                            resolve(false);
                        }

                        if (rows.length === 0) {
                            console.log("Licença não encontrada no banco de dados!");
                            resolve(false);
                        }

                        resolve(rows);
                    }
                );
            });

            return result;

        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async getLicenceKey (RowDataPacket){
        const rawData = RowDataPacket

        for (let i = 0; i < rawData.length; i++) {

            if (rawData[i].key == this.key) {
                return rawData[i];

            }
        }

        return false;
    }

    getStateProduct (RowDataPacket) {
        const rawData = RowDataPacket;

        if (rawData.state == "Ativo") {
    
            return rawData.state;
        }else if (rawData.state == "Suspenso") {
    
            return rawData.state;
        }

    }

    async controllerHash (RowDataPacket) {
        try {
            const rawData = RowDataPacket;
        
            if (rawData.key === this.key) {
                const getParentHash = await bcrypt.compare(this.key, rawData.hash);
                
                if (!getParentHash) {
                    console.log("Invalid parent key!")
                    return false;
                }
    
                const newHash = await bcrypt.hash(this.key, 10);

                const result = await new Promise((resolve, reject) => {
                    pool.query(
                        "UPDATE licence_private SET hash = ? WHERE `key` = ?", [newHash, this.key],
                        async (err, result) => {
                  
                            if (err) {
                                console.log("Failed to update licence key")
                                reject(false);
                            }

                            resolve(newHash)
                        }
                 
                    )
               
                })
                return result;
            }

        }catch(e) {
            console.log("Failed updating catch")
            return false;
        }
    }

    async updateProductState () {
        try {
            const result = new Promise ((resolve, reject) => {
                pool.query("UPDATE licence_private SET state = ? WHERE `key` = ?", ["Suspenso", this.key],
                async (err, result) => {
                    if (err) {
                        reject(err);
                        console.log("Failed to update state product!")
                    }
                    resolve(true);
                })                
       
            })

            return result
        }catch(e) {
            console.log("Failed updating catch")
            return false;
        }
    }

}


// Loading informations //
servidor.post("/vision/load-informations", async (request, response) => {
    const {email, key} = request.body[0];

    const call = new LicenceFunctions (email, key);
    const getLicenceEmailResult = await call.getLicenceEmail()

    if (!getLicenceEmailResult) {
        response.status(400).end();    
    }

    const getLicenceKey = await call.getLicenceKey(getLicenceEmailResult);
    
    if (!getLicenceKey) response.status(401).end();

    const getStateProduct = await call.getStateProduct(getLicenceKey)


    if (getStateProduct == "Ativo") {

        const controlHash = await call.controllerHash (getLicenceKey)
        if (!controlHash) response.status(402).end();
        totoalRequests++

        sendDiscordLogs( "Ativação Liberada!",  getLicenceKey.ip,  getLicenceKey.email, getLicenceKey.id, getLicenceKey.produto,  "1.0",  totoalRequests)        
        response.send(JSON.stringify({hash: controlHash}))

    }else {
        response.status(403).end();
    }

});


// start api
servidor.listen(servidorPort, ( ) => {
    console.log("Vision Aurora online!")
})

    
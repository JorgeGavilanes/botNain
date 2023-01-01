const express = require("express");
const bodyParser = require("body-parser");
const qrcode = require("qrcode-terminal");
const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

const client = new Client({
     authStrategy: new LocalAuth()
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('Cargando...');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
    console.log('Autenticado');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('Fallo de autenticación', msg);
});

client.on('ready', () => {
    console.log('Listo');
});

client.on('disconnected', (reason) => {
    console.log('Cliente fuera', reason);
});

app.post("/pedidonuevo", (req, res) => {
    // Esquema datos
    const data = {
        orden : 0,
        total : 0,
        userWhatsapp: "",
        userPhone: "",
        userName: "",
        userLastName : "",
        userAddress1 : "",
        userAddress2 : "",
        userReference : "",
        paymentMethod : "",
        shippingMethod : "",
        stores : [{storeName : "", storeAddress1 : "", storeAddress2 : ""}]
    };

    // Obtener datos
    if(req.body.parent_id == 0){
        // Número de orden
        data.orden = req.body.id;
        // Total del pedido
        data.total = parseFloat(req.body.total);
        // Whatsapp del cliente
        let whatsapp = req.body.billing.phone;
        data.userWhatsapp = "593" + whatsapp.slice(1);
        // Teléfono de resplado
        let phone = req.body.meta_data[0].value;
        data.userPhone = phone;
    }

    // Datos admin

    // Datos usuario

    // Mensaje admin
    client.sendMessage("593984795971@c.us", "Nueva tienda");
    client.sendMessage("593984795971@c.us", JSON.stringify(data));
    client.sendMessage("593984795971@c.us", JSON.stringify(req.body));
    let confirmacion = new Buttons("Hola",[{id:`${data.orden},true`, body:'Confirmar'}],'','Nain - ¡Tu portal de tiendas online!');
            
    client.sendMessage("593984795971@c.us", confirmacion);

    // Mensaje usuario

    // Enviar respuesta ruta
    res.status(200).send("Ok");
    /*


// Enviar datos al whastapp
    // Una tienda
    if(req.body.id != 0){
        if (data.isDelivery){
            const clientMsg = 
            `¡Hola ${data.userName}, gracias por tu pedido🥳!
--------------------------
Orden : *${data.orden}*
Método de pago : ${data.paymentMethod}
Método de envío : ${data.shippingMethod}
*Costo total : $${data.total}*

Por favor confirma tu compra`
    
            // let confirmacion = new Buttons(clientMsg,[{id:`${data.orden},true`, body:'Confirmar'}],'','Nain - ¡Tu portal de tiendas online!');
            
            // client.sendMessage(data.userWhatsapp + "@c.us", confirmacion);
            client.sendMessage(data.userWhatsapp + "@c.us", clientMsg);
        } else {
            const clientMsg = 
            `¡Hola ${data.userName}, gracias por tu pedido🥳!
--------------------------
Orden : *${data.orden}*
Método de pago : ${data.paymentMethod}
Método de envío : ${data.shippingMethod}
Nombre de la tienda : ${data.stores[0][0]}
Calle principal de la tienda : ${data.stores[0][1]}
Calle secundaria de la tienda : ${data.stores[0][2]}
*Costo total : $${data.total}*

Por favor confirma tu compra`
    
            // let confirmacion = new Buttons(clientMsg,[{id:`${data.orden},true`, body:'Confirmar'}],'','Nain - ¡Tu portal de tiendas online!');
            
            // client.sendMessage(data.userWhatsapp + "@c.us", confirmacion);
            client.sendMessage(data.userWhatsapp + "@c.us", clientMsg);
        }
    } else {
        // Multi tienda
    }*/
});

app.get("/", (req, res) => {
    res.send("¡Hola mundo!");
    console.log("Ingreso a botnain.onrender.com");
});

app.listen(port, () => {
    console.log("Servidor iniciado");
});


/*
//Enviar mensaje de pedido nuevo al admin
    const adminMsg = 
            `¡Nuevo pedido🎉!
---------------------
Orden : *${data.orden}*
Nombre del cliente : ${data.userName}
Apellido del cliente : ${data.userLastName}
Whatsapp del cliente : ${data.userWhatsapp}
Método de pago : ${data.paymentMethod}
Método de envío : ${data.shippingMethod}
Calle principal del cliente : ${data.userAddress1}
Calle secundaria del cliente : ${data.userAddress2}
Nombre de la tienda : ${data.stores[0][0]}
Calle principal de la tienda : ${data.stores[0][1]}
Calle secundaria de la tienda : ${data.stores[0][2]}
*Costo total : $${data.total}*`
    client.sendMessage("593988858191@c.us", adminMsg);
*/
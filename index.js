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
    const data = {
        orden : 0,
        isDelivery : false,
        total : 0,
        userWhatsapp: "",
        userName: "",
        userLastName : "",
        userAddress1 : "",
        userAddress2 : "",
        paymentMethod : "",
        shippingMethod : "",
        stores : []
    };

    // Estado de la petición
    res.status(200).send("Ok");

    // Número de orden
    (req.body.id == 0)
    ? data.orden = req.body.parent_id //multiTiendas
    : data.orden = req.body.id; //unaTienda

// Guardar datos al objeto
    //Una tienda
    if(req.body.id != 0){
        // Delivery
        (req.body.shipping_total == "0.00")
        ? data.isDelivery = false
        : data.isDelivery = true;
        // Total del pedido
        data.total = parseFloat(req.body.total);
        // Whatsapp del cliente
        let phone = req.body.billing.phone;
        data.userWhatsapp = "593" + phone.slice(1);
        // Nombre del cliente
        data.userName = req.body.shipping.first_name;
        // Apellido del cliente
        data.userLastName = req.body.shipping.last_name;
        // Calle 1 del cliente
        data.userAddress1 = req.body.shipping.address_1;
        // Calle 2 del cliente
        data.userAddress2 = req.body.shipping.address_2;
        // Tipo de pago
        data.paymentMethod = req.body.payment_method_title;
        // Tipo de envío
        data.shippingMethod = req.body.shipping_lines[0].method_title;
        // Tienda
        const tienda = []
        // Nombre de la tienda
        tienda.push(req.body.store.shop_name);
        // Dirección 1 de la tienda
        tienda.push(req.body.store.address.street_1);
        // Dirección 2 de la tienda
        tienda.push(req.body.store.address.street_2);
        data.stores.push(tienda);
    } else {
        // Multi tienda
    }
    
    console.log("Nuevo pedido");

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
    }
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
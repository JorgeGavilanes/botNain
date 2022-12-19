const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.post("/pedidonuevo", (req, res) => {
    const data = {
        orden : 0,
        isDelivery : false,
        total : 0,
        userWhatsapp: 0,
        userName: "",
        userLastName : "",
        userAddress1 : "",
        userAddress2 : "",
        paymentMethod : "",
        shippingMethod : "",
        storeName : "",
        storeAddress1  : "",
        storeAddress2 : ""
    };
    // Estado de la petición
    res.status(200).send("ok");
    // Número de orden
    (req.body.id == 0)
    ? data.orden = req.body.parent_id
    : data.orden = req.body.id;
    if(req.body.id != 0){
        // Delivery
        (req.body.shipping_total == "0.00")
        ? data.isDelivery = false
        : data.isDelivery = true;
        // Total del pedido
        data.total = parseFloat(req.body.total);
        // Whatsapp del cliente
        data.userWhatsapp = parseFloat("593" + req.body.billing.phone);
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
        // Nombre de la tienda
        data.storeName = req.body.store.shop_name;
        // Dirección 1 de la tienda
        data.storeAddress1 = req.body.store.address.street_1;
        // Dirección 2 de la tienda
        data.storeAddress2 = req.body.store.address.street_2;
    }
    
    console.log("Nuevo pedido");
    console.log(data);
});

app.get("/", (req, res) => {
    res.send("¡Hola mundo!");
    console.log("Acceding to content");
});

app.listen(port, () => {
    console.log("Server running");
})
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.post("/pedidonuevo", (req, res) => {
    res.status(200).send("ok");
    console.log("Nuevo pedido");
    console.log(req.body);
});

app.get("/", (req, res) => {
    res.send("¡Hola mundo!");
    console.log("Acceding to content");
});

app.listen(port, () => {
    console.log("Server running");
})
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("¡Hola mundo!");
    console.log("Acceding to content");
});

app.listen(port, () => {
    console.log("Server running");
})
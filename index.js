const express = require("express");
const bodyParser = require("body-parser");
const qrcode = require("qrcode-terminal");
const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = process.env.PORT || 8080;
const puppeteer = require("puppeteer-core");

async function run() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/path/to/node_modules/chromium"
    });
    
    app.use(bodyParser.json());

    const client = new Client({
        // authStrategy: new LocalAuth(),
        puppeteer: { 
            headless: true
        }
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
    /*
    client.on('message', async msg => {
        if (msg.body === '!ping reply') {
            // Send a new message as a reply to the current one
            msg.reply('pong');

        } else if (msg.body === '!ping') {
            // Send a new message to the same chat
            client.sendMessage(msg.from, 'pong');

        } else if (msg.body.startsWith('!sendto ')) {
            // Direct send a new message to specific id
            let number = msg.body.split(' ')[1];
            let messageIndex = msg.body.indexOf(number) + number.length;
            let message = msg.body.slice(messageIndex, msg.body.length);
            number = number.includes('@c.us') ? number : `${number}@c.us`;
            let chat = await msg.getChat();
            chat.sendSeen();
            client.sendMessage(number, message);

        } else if (msg.body.startsWith('!subject ')) {
            // Change the group subject
            let chat = await msg.getChat();
            if (chat.isGroup) {
                let newSubject = msg.body.slice(9);
                chat.setSubject(newSubject);
            } else {
                msg.reply('This command can only be used in a group!');
            }
        } else if (msg.body.startsWith('!echo ')) {
            // Replies with the same message
            msg.reply(msg.body.slice(6));
        } else if (msg.body.startsWith('!desc ')) {
            // Change the group description
            let chat = await msg.getChat();
            if (chat.isGroup) {
                let newDescription = msg.body.slice(6);
                chat.setDescription(newDescription);
            } else {
                msg.reply('This command can only be used in a group!');
            }
        } else if (msg.body === '!leave') {
            // Leave the group
            let chat = await msg.getChat();
            if (chat.isGroup) {
                chat.leave();
            } else {
                msg.reply('This command can only be used in a group!');
            }
        } else if (msg.body.startsWith('!join ')) {
            const inviteCode = msg.body.split(' ')[1];
            try {
                await client.acceptInvite(inviteCode);
                msg.reply('Joined the group!');
            } catch (e) {
                msg.reply('That invite code seems to be invalid.');
            }
        } else if (msg.body === '!groupinfo') {
            let chat = await msg.getChat();
            if (chat.isGroup) {
                msg.reply(`
                    *Group Details*
                    Name: ${chat.name}
                    Description: ${chat.description}
                    Created At: ${chat.createdAt.toString()}
                    Created By: ${chat.owner.user}
                    Participant count: ${chat.participants.length}
                `);
            } else {
                msg.reply('This command can only be used in a group!');
            }
        } else if (msg.body === '!chats') {
            const chats = await client.getChats();
            client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
        } else if (msg.body === '!info') {
            let info = client.info;
            client.sendMessage(msg.from, `
                *Connection info*
                User name: ${info.pushname}
                My number: ${info.wid.user}
                Platform: ${info.platform}
            `);
        } else if (msg.body === '!mediainfo' && msg.hasMedia) {
            const attachmentData = await msg.downloadMedia();
            msg.reply(`
                *Media info*
                MimeType: ${attachmentData.mimetype}
                Filename: ${attachmentData.filename}
                Data (length): ${attachmentData.data.length}
            `);
        } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();

            quotedMsg.reply(`
                ID: ${quotedMsg.id._serialized}
                Type: ${quotedMsg.type}
                Author: ${quotedMsg.author || quotedMsg.from}
                Timestamp: ${quotedMsg.timestamp}
                Has Media? ${quotedMsg.hasMedia}
            `);
        } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.hasMedia) {
                const attachmentData = await quotedMsg.downloadMedia();
                client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
            }
        } else if (msg.body === '!location') {
            msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
        } else if (msg.location) {
            msg.reply(msg.location);
        } else if (msg.body.startsWith('!status ')) {
            const newStatus = msg.body.split(' ')[1];
            await client.setStatus(newStatus);
            msg.reply(`Status was updated to *${newStatus}*`);
        } else if (msg.body === '!mention') {
            const contact = await msg.getContact();
            const chat = await msg.getChat();
            chat.sendMessage(`Hi @${contact.number}!`, {
                mentions: [contact]
            });
        } else if (msg.body === '!delete') {
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    quotedMsg.delete(true);
                } else {
                    msg.reply('I can only delete my own messages');
                }
            }
        } else if (msg.body === '!pin') {
            const chat = await msg.getChat();
            await chat.pin();
        } else if (msg.body === '!archive') {
            const chat = await msg.getChat();
            await chat.archive();
        } else if (msg.body === '!mute') {
            const chat = await msg.getChat();
            // mute the chat for 20 seconds
            const unmuteDate = new Date();
            unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
            await chat.mute(unmuteDate);
        } else if (msg.body === '!typing') {
            const chat = await msg.getChat();
            // simulates typing in the chat
            chat.sendStateTyping();
        } else if (msg.body === '!recording') {
            const chat = await msg.getChat();
            // simulates recording audio in the chat
            chat.sendStateRecording();
        } else if (msg.body === '!clearstate') {
            const chat = await msg.getChat();
            // stops typing or recording in the chat
            chat.clearState();
        } else if (msg.body === '!jumpto') {
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                client.interface.openChatWindowAt(quotedMsg.id._serialized);
            }
        } else if (msg.body === '!buttons') {
            let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
            client.sendMessage(msg.from, button);
        } else if (msg.body === '!list') {
            let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
            let list = new List('List body','btnText',sections,'Title','footer');
            client.sendMessage(msg.from, list);
        } else if (msg.body === '!reaction') {
            msg.react('👍');
        }
    });
    */
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
            // Nombre de la tienda
            data.storeName = req.body.store.shop_name;
            // Dirección 1 de la tienda
            data.storeAddress1 = req.body.store.address.street_1;
            // Dirección 2 de la tienda
            data.storeAddress2 = req.body.store.address.street_2;
        }
        
        console.log("Nuevo pedido");
        console.log(data);

        if (data.isDelivery){
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
    Nombre de la tienda : ${data.storeName}
    Calle principal de la tienda : ${data.storeAddress1}
    Calle secundaria de la tienda : ${data.storeAddress2}
    *Costo total : $${data.total}*`

            const clientMsg = 
            `¡Gracias por tu pedido🥳!
    --------------------------
    Orden : *${data.orden}*
    Método de pago : ${data.paymentMethod}
    Método de envío : ${data.shippingMethod}
    Nombre de la tienda : ${data.storeName}
    Calle principal de la tienda : ${data.storeAddress1}
    Calle secundaria de la tienda : ${data.storeAddress2}
    *Costo total : $${data.total}*

    Por favor confirma tu compra`

            let confirmacion = new Buttons(clientMsg,[{id:`${data.orden},true`, body:'Confirmar'},{id:`${data.orden},false`, body:'Cancelar'}],'','Nain - ¡Tu portal de tiendas online!');
            
            client.sendMessage("593988858191@c.us", adminMsg);
            client.sendMessage(data.userWhatsapp + "@c.us", confirmacion);
        }
    });

    app.get("/", (req, res) => {
        res.send("¡Hola mundo!");
        console.log("Acceding to content");
    });

    app.listen(port, () => {
        console.log("Server running");
    });

  }

run();
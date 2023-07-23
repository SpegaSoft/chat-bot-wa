const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require("@bot-whatsapp/database/mock") // PRO


    const flowBienvenida = addKeyword(EVENTS.WELCOME)
    .addAnswer(
        [
            'Gracias por comunicate con *SPEGASOFT*',
            '',
            'Este celular *NO está activo*.',
            '',
            'Por favor comunicate al numero 👇🏻\n',
            'Clic aca 👉 https://api.whatsapp.com/send?phone=5491162297379'
        ]
    );    
    
    const main = async () => {
    const adapterDB = new MockAdapter(); //PRO
    
    const adapterFlow = createFlow([
        flowBienvenida,
      ]);

    const adapterProvider = createProvider(BaileysProvider)
    createBot(
        {
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        }
    )
    QRPortalWeb()
}

main()

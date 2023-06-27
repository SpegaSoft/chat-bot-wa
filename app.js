const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
/**
 * Declaramos las conexiones de MySQL
 
const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'root'
const MYSQL_DB_PASSWORD = ''
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'
*/
const flowPrincipal = addKeyword(['buen día','buenas tardes','buenas noches','hola','ola','ole','buenas','atender','alguien','atiende'])
    .addAnswer(
        [
            '🤖',
            'Hola soy el *ChatBot de SPEGASOFT* en que te puedo asistir?',
            'escribe:',
            '*Ventas* para ventas y administración',
            '*Soporte* para soporte técnico',
        ],
    )


const flowVentas = addKeyword(['ventas','valor','renovacion','facturacion','factura','info','informacion']).addAnswer(
    [
        '🤖',
        'Valor de Licencia $53.000 unico pago por PC',
        'Facturacion Electronica $26.000 semestral por CUIT',
        'Medio de pago transferencia, mercadopago o efectivo',
        'Soporte tecnico sin cargo',
        'Preguntas frecuentes:',
        '👉 https://goo.su/F5WCHh', //https://spegasoft.com/wp/preguntas-frecuentes
        'Si necesita asesoramiento personalizado le podemos llamar',
        '*Llamar*',
    ],
)

const flowServicios = addKeyword(['nube','renovar','facturacion','factura','abono','transferir']).addAnswer(
    [
        '🤖',
        '$26.000 por servicio individual ya sea facturacion electronica o nube',
        'Alias: spegasoft.emilia',
        'Emilia Benitez',
        'Junto al comprobante pasanos el CUIT por favor',
    ],
)

const flowSoporte = addKeyword(['soporte','no me funciona','problema','error','lenta','lento','ayuda','no inicia','no arranca','no funciona']).addAnswer(
    [
        '🤖',
        'Foro de Ayuda:',
        '👉  https://goo.su/ZfYewA', // https://www.spegasoft.com/wp/community
        'Tutoriales Canal de Youtube:',
        '👉 https://goo.su/4pEmLOw', //https://www.youtube.com/playlist?list=PLP6CdpxE4cnU2vsi0hHcYIOW7d-gfI43f
        'Habla con Nadia:',
        '👉 https://goo.su/AdDvH', //https://api.whatsapp.com/send?phone=5491157255559
    ],
)

const flowInfo = addKeyword(['horario','horarios','dias']).addAnswer(
    [
        '🤖',
        'Dias y horarios de atecion, lun a vie 10hs a 18hs',
    ],
)

const flowVoiceNote = addKeyword([EVENTS.VOICE_NOTE,EVENTS.MEDIA,EVENTS.DOCUMENT]).addAnswer(
    [
        '🤖',
        'Si enviaste Foto, Audio, Video o PDF, no lo puedo interpretar. Escribime texto por favor',
    ],
)

/*
const flowGracias = addKeyword('gracias').addAnswer(
    '🤖\nEspero que tu experiencia halla sido satisfactoria, gracias a vos.\nMe podes calificar\n', {
    buttons: [{ body: '⭐ ⭐ ⭐' }, { body: '⭐ ⭐' }, { body: '⭐' }]
})
*/

/*
const flowGracias = addKeyword('gracias').addAnswer('Este mensaje envia tres botones', {
    buttons: [{ body: 'Boton 1' }, { body: 'Boton 2' }, { body: 'Boton 3' }],
    capture: true
})
*/

const flowGracias = addKeyword('grac').addAnswer('Espero que tu experiencia halla sido satisfactoria, gracias a vos.', {
    media: 'http://spegasoft.com/chatbot-wa/gracias-bot.png',
    
    /*
    buttons: [
        { body: '⭐ ⭐ ⭐' },
        { body: '⭐ ⭐' },
        { body: '⭐' }
    ]
    */
})


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal,flowVoiceNote,flowInfo,flowVentas,flowServicios,flowSoporte,flowGracias])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()

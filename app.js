const axios = require('axios');
var CuitCliente;

const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
//const MySQLAdapter = require('@bot-whatsapp/database/mysql') //DEV
const MockAdapter = require("@bot-whatsapp/database/mock") // PRO

// Declaramos las conexiones de MySQL
const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'root'
const MYSQL_DB_PASSWORD = ''
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'

    const CuitApi = async (Cuit) => {
        const url = `https://www.spegasoft.com/vencimientos/servicios.php?Cuit=${Cuit}`;
        const respuesta = await axios.get(url);
        return respuesta.data
    }
    
    const flowConsultarCuit = addKeyword('1')
    .addAnswer(
        'ingresa el CUIT (sin guines y sin espacios)'
        , {capture:true} , (ctx,{ fallBack }) => {
            CuitCliente = ctx.body
            if (CuitCliente.length < 10) return fallBack()
        }
    ).addAnswer('Procesando ...', null, async (ctx, {flowDynamic}) => {
        const data = await CuitApi(CuitCliente);
        //console.log('cuit cliente: ' + CuitCliente);
        //console.log('respuesta del servidor' + data);
        if (data === '') {
                flowDynamic('El CUIT ingresado no corresponde a un abonado');
            }else{
                flowDynamic('Vencimiento: ' + data);
            }
        
        }
    );

    const flowTest = addKeyword('test') // TEST
    .addAnswer('https://www.youtube.com/watch?v=I89zq_KOBto&list=PLP6CdpxE4cnV1UTNpUAlDTbEKeuCldV1_&index=3&pp=gAQBiAQB'
    );

    const flowSalir = addKeyword('9', {sensitive: true,}) // SALIR
        .addAnswer('🤖 Gracias por comunicate con *SpegaSoft*, espero que tu experiencia halla sido satisfactoria.', {
        media: 'http://spegasoft.com/chatbot-wa/tuerquita.png'});
    
    const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE) //AUDIOS
        .addAnswer('🤖 No puedo escuchar tu audio, por favor escribe texto.');
    
    const flowMedia = addKeyword([EVENTS.DOCUMENT,EVENTS.MEDIA]) // PDF IMAGENES
        .addAnswer('🤖 Por favor necesito que me expliques el contexto de la captura o documento.');

    const flowHumano = addKeyword('6', {sensitive: true,}) // PDF IMAGENES
        .addAnswer(
            [
            '🤖 *HUMANO*',
            'Necesito que nos brindes los siguientes datos:',
            '- Nombre de quien se encuentra el sistema.',
            '- Explica detalladamente el problema.',
            '- Cantidad de maquinas afectadas.',
            '- CUIT de facturacion',
            '- Disponibilidad Horaria.',
            '👉 https://goo.su/AdDvH', //https://api.whatsapp.com/send?phone=5491157255559
            ]
        );


    
    const flowAsesoramiento1 = addKeyword('2', {sensitive: true,})
        .addAnswer(
            [
            
                '🤖 *ASESORAMIENTO 1*',
                'En que tipo de comercio o rubro lo necesitas Instalar?',
                'escribe estrictamente:',
                '1️⃣ ALMACEN / MERCADO /', // PRECIOS
                '2️⃣ FIAMBRERIA / CARNICERIA / DIETETICA', // ASESORAMIENTO
                '3️⃣ OTROS ...',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
    
                if (![1, 2, 3, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                    await fallBack()
                    return
                }
            },
            [flowSalir]
        );

    const flowInformarPagos = addKeyword('3', {sensitive: true,})
        .addAnswer(
            [            
                '🤖 *INFORMAR PAGOS*',
                'Por favor, junto al comprobante de pago escribe el CUIT de facturacion ó nombre de la NUBE',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
    
                if (![9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                    await fallBack()
                    return
                }
            },
            [flowSalir]
        );

    const flowSoporteNoImprime = addKeyword('1', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '🤖 *NO IMPRIME*',
            'Revisa los siguientes Tips:',
            '- Esta conectada y encendida?',
            '- Tiene papel?',
            '- Al presionar el boton AVANZAR/FEED, sale papel?',
            '- En cola de Impresión de windows, figura "usar sin conexion"?',


        
            ]    
        );
    
    const flowSoporteCartelError = addKeyword('2', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '🤖 *CARTEL DE ERROR*',
            'Por favor responde las siguientes preguntas:',
            '- La pc es Servidora o Terminal?',
            '- Podes detallar el mensaje y adjuntar captura',
            '- Detallar que operación intentas realizar?',
            '- Posees servicio de Factura Electronica?',        
            ]    
        );
    
    const flowSoporteBalanzaNoPesa = addKeyword('3', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '🤖 *LA BALANZA NO PESA*',
            'Por favor responde las siguientes preguntas:',
            '- Que Marca y modelo de Balanza Tenes?',
            '- Esta conectada?',
            '- Esta Configurada?',
            '- Posees servicio de Factura Electronica? de ser asi indica el CUIT',        
            ]    
        );

    const flowSoporteLento = addKeyword('4', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '🤖 *FUNCIONA LENTO*',
            'Por favor responde las siguientes preguntas:',
            '- La pc es Servidora o Terminal?',
            '- Si es Terminal, esta conectada por WIFI? si es por cable, verificar falsos cotactos',
            '- Posees servicio de Factura Electronica? de ser asi indica el CUIT',        
            ]    
        );
    
    const flowSoporteInformes = addKeyword('5', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '🤖 *SACAR INFORMES*',
            'Por favor responde las siguientes preguntas:',
            '- Que tipo de Informe necesitas?',
            '- Si lo necesitas en Excel, verifica tener Excel instalado',
            '- bla bla vla ...',        
            ]    
        );

    const flowSoporteTecnico = addKeyword('3', {sensitive: true,})// ,'nube','renovar','renovacion','factura','facturacion','facturación','abono','transferir','vencio','venció','vencido','servicio','vencida'])
        .addAnswer(
            [
                '🤖 *SOPORTE TECNICO*',
                'ACCESO AL FORO DE AYUDA:',
                '👉  https://goo.su/ZfYewA', // https://www.spegasoft.com/wp/community
                'TUTORIALES DE YOUTUBE:',
                '👉 https://goo.su/4pEmLOw', //https://www.youtube.com/playlist?list=PLP6CdpxE4cnU2vsi0hHcYIOW7d-gfI43f
                'escribe estrictamente:',
                '1️⃣ NO IMPRIME',
                '2️⃣ ME APARECE UN CARTEL DE ERROR',
                '3️⃣ LA BALANZA NO PESA',
                '4️⃣ FUNCIONA LENTO',
                '5️⃣ NECESITO GENERAR/SACAR LISTADOS Ó INFORMES Y NO SE COMO',
                '6️⃣ HABLAR CON UN SER HUMANO (aca pide datos del cliente)',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
    
                if (![1, 2, 3, 4, 5, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                    await fallBack()
                    return
                }
            },
            [flowSalir,flowSoporteNoImprime,flowSoporteCartelError,flowSoporteBalanzaNoPesa,flowSoporteLento,flowSoporteInformes,flowSoporteInformes,flowHumano]
        )
    
    const flowServicios = addKeyword('2', {sensitive: true,})// ,'nube','renovar','renovacion','factura','facturacion','facturación','abono','transferir','vencio','venció','vencido','servicio','vencida'])
        .addAnswer(
            [
                '🤖 *SERVICIOS*',
                '$26.000 por servicio individual ya sea facturacion electronica o nube',
                'Alias: spegasoft.emilia',
                'Emilia Benitez',
                'Por favor, junto al comprobante pasanos el CUIT de facturacion',
                'escribe estrictamente:',
                '1️⃣ CONTRATAR FACTURACION',
                '2️⃣ CONTRATAR SONCRONIZACION DE PRECIOS',
                '3️⃣ RENOVAR SERVICIO',
                '4️⃣ INFORMAR PAGO',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
    
                if (![1, 2, 3, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                    await fallBack()
                    return
                }
            },
            [flowConsultarCuit,flowSalir,flowInformarPagos]
        )

    const flowPrecios = addKeyword('1', {sensitive: true,})
        .addAnswer(
            [
            '🤖 *PRECIOS*',
            'Licencia $53.000 unico pago por PC',
            'Facturacion Electronica $26.000 semestral por CUIT',
            'Medio de pago transferencia, mercadopago o efectivo',
            'Instalacion y Soporte tecnico sin cargo',
            'Preguntas frecuentes:',
            '👉 https://goo.su/F5WCHh', //https://spegasoft.com/wp/preguntas-frecuentes
            'Si necesita asesoramiento personalizado le podemos llamar',
            'Escribe *Llamar*'
            ],
        )
    
    const flowAdministracion = addKeyword('2', {sensitive: true,})
       .addAnswer(
            [
                '🤖 *ADMINISTRACION*',
                'escribe estrictamente:',
                '1️⃣ PRECIOS DE LICENCIAS', // PRECIOS
                '2️⃣ CONTRATAR Ó RENOVAR SERVICIO', // RENOVACION
                '',
                '9️⃣ SALIR' //SALIR
              ],
              { capture: true },
              async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                  //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
      
                  if (![1, 2, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                      //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                      await fallBack()
                      return
                  }
              },
            [flowPrecios,flowServicios,flowSalir]
    );

    const flowVentas = addKeyword('1', {sensitive: true,})
        .addAnswer(
            [
              '🤖 *VENTAS*',
              'escribe estrictamente:',
              '1️⃣ PRECIOS', // PRECIOS
              '2️⃣ ASESORAMIENTO', // ASESORAMIENTO
              '',
              '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })
    
                if (![1, 2, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                    await fallBack()
                    return
                }
            },
            [flowPrecios,flowAsesoramiento1,flowSalir]
    );

    const flowBienvenida = addKeyword(['hola','buen dia','buenos dias','buenas tardes','buen día','buendia','un problema','no funciona','no fiscaliza','contratar','comprar','comprarte','falla'])
    .addAnswer(
        [
            'Gracias por comunicarse con *SpegaSoft*',
            'Soy 🤖 *TUERQUITA* Estoy aqui para brindarte informacion y guiarte en el proceso.',
            'escribe estrictamente:',
            '1️⃣ VENTAS', // ADMINISTRACION Y SOPORTE
            '2️⃣ ADMINISTRACION', // VENTAS
            '3️⃣ SOPORTE TECNICO', //SOPORTE TECNICO
            '',
            '9️⃣ SALIR'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            //globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })

            if (![1, 2, 3, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                await fallBack()
                return
            }
        },
        [flowSoporteTecnico,flowVentas,flowAdministracion,flowSalir]
    );    
    
    /*
    const flowLlamar = addKeyword(['llamar','asesoramiento','asesorar','llamada','llamadita','llamadito'])
        .addAnswer('🤖 A la brevedad le estaran llamando.');
    
    const flowHumano = addKeyword('humano')
        .addAnswer('🤖 me desactive para que puedas hablar con un ser humano.',null, () => {global.BotActivo = false});
    */

    const main = async () => {
    const adapterDB = new MockAdapter(); //PRO
    
    /*
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    */
    
    const adapterFlow = createFlow([
        //flowString,
        //flowFormulario,
        flowTest,
        flowVoiceNote,
        flowMedia,
        flowBienvenida,
      ]);

    const adapterProvider = createProvider(BaileysProvider)
    createBot(
        {
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        },
        {
            blackList: ['5491157255559', '5492262593939'], //numeros a los que no responde
        }
    )
    QRPortalWeb()
}

main()
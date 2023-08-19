const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const RESPONSES_SHEET_ID = '1ZfdEzUiJs6mDjg4Akdrp7TQXRXyqOlDsmALWyDjs-0A'; //Aquí pondras el ID de tu hoja de Sheets
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);
//const CREDENTIALS = JSON.parse(fs.readFileSync('./credenciales.json'));


const axios = require('axios');
var CuitCliente; //para almacenar CUIT de consulta

let STATUS = {}

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

function HorarioAtencion() {
    const diasSemana = ['Domingo','Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaActual = new Date();
    const diaSemana = diasSemana[fechaActual.getDay()];
    const hora = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const Actual = `es ${diaSemana} a las ${hora}.${minutos}hs`;

    // Definir el rango horario permitido (de lunes a viernes, de 9:00 a 18:00)
    const horaInicio = 9;
    const horaFin = 18;
    const diasPermitidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    if (diasPermitidos.includes(diaSemana) && hora >= horaInicio && hora < horaFin) {
            mensaje = 'Un representante de Soporte Tecnico se pondrá en contacto para solucionar el problema a la brevedad.'
        }else{
            mensaje = '*Tene en cuenta que ' + Actual + '* '+
            'y nuestro horario de Atencion es Lun a Vie 9.00 a 18.00hs.\n'+
            'Si necesitas resolver el problema ahora, disponemos de atencion Tecnica de Emergencia (tiene costo un adicional) 👇🏻\n'+
            '👉 https://spegasoft.com/servicio-de-emergencia/';
    };
    
    return mensaje;

  }

function MensajePreparcionAsistencia() {
    mensaje = '*PREPACION DE ASISTENCIA*\n\n'+
            'Tene en cuenta que seguramente tendremos que *acceder remotamente* a la PC en cuestion.\n'+
            'Verifica de tener instalado el programa *UltraViewer* de la pagina https://www.ultraviewer.net/es/download.html\n'+
            'Necesitaremos que al momento de la *asistencia remota*, poder comunicarnos con la persona que este frente a la PC.\n'+
            'Si no vas a ser vos, pasanos el contacto de la misma, muchas gracias.';    
    return mensaje;

};
  
  //console.log(obtenerDiaHoraActual());
  

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
                await flowDynamic('El CUIT ingresado no corresponde a un abonado');
            }else{
                await flowDynamic('Vencimiento: ' + data);
            }
        
        }
    );

    const flowTest = addKeyword('test') // TEST
        .addAnswer('https://www.youtube.com/watch?v=I89zq_KOBto&list=PLP6CdpxE4cnV1UTNpUAlDTbEKeuCldV1_&index=3&pp=gAQBiAQB')

    const flowSalir = addKeyword('9', {sensitive: true,}) // SALIR
        .addAnswer('Que tengas un buen dia.', {
        media: 'http://spegasoft.com/chatbot-wa/tuerquita.png'});
    
    const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE) //AUDIOS
        .addAnswer('No puedo escuchar tu audio, por favor escribe texto.')
    
    const flowMedia = addKeyword([EVENTS.DOCUMENT,EVENTS.MEDIA]) // PDF IMAGENES
        .addAnswer('Por favor necesito que me expliques el contexto de la captura o documento.')

    /*
    const flowHumano = addKeyword('0', {sensitive: true,}) // HUMANO
        .addAnswer('Dejame consultar ... ', null, async (ctx, {flowDynamic}) => {
            flowDynamic(HorarioAtencion());
            }
        );
    */
    
    const flowAsesoramiento1 = addKeyword('2', {sensitive: true,})
        .addAnswer(
            [
            
                '🤖 *ASESORAMIENTO 1*',
                'En que tipo de comercio o rubro lo necesitas Instalar?',
                '_responde con la opcion numerica_',
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
                'Por favor, junto al comprobante de pago escribe el CUIT de facturacion ó nombre de la NUBE',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                
                if (![9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    await fallBack()
                    return
                }
            },
            [flowSalir]
        );

    const flowSoporteNoImprime = addKeyword('1', {sensitive: true,}) // SALIR
        /*
        .addAnswer('Posibles soluciones al problema de *NO IMPRIME*', {
        media: 'http://spegasoft.com/chatbot-wa/Spegasoft%20-%20No%20Imprime.pdf'})
        */
        .addAnswer(
            [
                '*PULSA EN EL ENLACE*, para ver la solucion: ',
                '👉 https://spegasoft.com/soporte/no-imprime-no-sale-ticket/',
                '',
                '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
                '',
                'Si ya verificaste todos los pasos descriptos en el LINK y no lograste que imprima.'
            ]
            , null, async (ctx, {flowDynamic}) => {
            await flowDynamic(HorarioAtencion());
            }
        );


    const flowSoporteNoFiscaliza = addKeyword('2', {sensitive: true,}) // SALIR
        .addAnswer(
            [
            '_PARA *RESOLVER* EL PROBLEMA NECESITAMOS QUE *LEAS DETENIDAMENTE*._',
            '',
            'Por favor responde las siguientes preguntas:',
            '- Aparece algun mensaje que mencione la causa del problema?',
            '- Que dice el mensaje?',
            '- Envia *Foto* o *Captura* del mensaje, que sea perfectamente legible.',
            '',
            'Envianos los siguientes datos:',
            '- CUIT de facturacion.',
            '- CUIT de acceso a AFIP',
            '- Clave Fiscal',
            '- Foto de alguna factura (legible) emitida por el punto de venta en cuestion.',
            '',
            'Una vez enviada toda la informacion requerida un representante de Soporte Tecnico se pondrá en contacto para solucionar el problema.' 
            ]
            , null, async (ctx, {flowDynamic}) => {
            await flowDynamic(MensajePreparcionAsistencia());
            }
        )
        .addAnswer(" ", null, async (ctx, {flowDynamic}) => {
            await flowDynamic(HorarioAtencion());
            }

        )
    
    
    const flowSoporteBalanzaNoPesa = addKeyword('3', {sensitive: true,}) // SALIR
        .addAnswer(
            [
                '',
                '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
                '',
                'Por favor responde las siguientes preguntas:',
                '- Que Marca y modelo de Balanza Tenes?',
                '- Esta conectada?',
                '- Esta Configurada?',
                '- Posees servicio de Factura Electronica? de ser asi indica el CUIT',
            ]
            , null, async (ctx, {flowDynamic}) => {
                await flowDynamic(HorarioAtencion());
                }
        );

    const flowSoporteLento = addKeyword('4', {sensitive: true,}) // SALIR
        .addAnswer(
            [
                '',
                '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
                '',
                'Por favor responde las siguientes preguntas:',
                '- La PC es Servidora o Terminal?',
                '- Si es Terminal, esta conectada por WIFI ó por CABLE?, verificar falsos contactos, suciedad en las fichas, etc',
                '- Posees servicio de Factura Electronica? de ser asi indica el CUIT',
            ]
            , null, async (ctx, {flowDynamic}) => {
                await flowDynamic(HorarioAtencion());
                }
        );
    
    const flowSoporteInformes = addKeyword('5', {sensitive: true,}) // SALIR
        .addAnswer(
            [
                '',
                '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
                '',
                'Por favor responde las siguientes preguntas:',
                '- Que tipo de Informe necesitas?',
                '- Si lo necesitas en Excel, verifica tener Excel instalado',
                '- bla bla vla ...'
            ]
            , null, async (ctx, {flowDynamic}) => {
                await flowDynamic(HorarioAtencion());
                }
        );
    
    const flowSoporteCartelError = addKeyword('6', {sensitive: true,})
        .addAnswer(
        [
            '',
            '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
            '',
            'Luego de aceptar el cartel de ERROR:',
            '',
            '1️⃣ EL SISTEMA SE CIERRA, QUEDA TILDADO O NO ME DEJA OPERAR',
            '2️⃣ SI ME DEJA OPERAR Y ES SOLO UN CARTEL DE ADVERTENCIA'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {

            if (![1, 2].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                await fallBack()
                return
            }
            await flowDynamic([
                '*ESCRIBE DETALLADAMENTE ó ENVIA UN AUDIO*',
                '1. ¿Cuándo ocurre el error? ¿Es al iniciar el software, al realizar una acción específica o en algún momento en particular?',
                '2. Explica exactamente que acción o tarea intentas realizar',
                '3. Envianos capturas de pantalla, fotos ó grabaciones de video que muestren el error.',
                '',
                'RESPONDE A LAS SIGUIENTE PREGUNTA:',
                '1. ¿Cuál es la versión del software que estás utilizando? podes verlo en la parte inferior derecha de la pantalla en la ventana de venta.',
                '2. ¿Has realizado alguna actualización reciente del software u otros programas relacionados? Puede ser actualización de Windows, del Software de Fácil Gestión, de Office, Etc.…',
                '3. ¿Has realizado alguna acción o configuración particular antes de que apareciera el error?'
                ]);
            if (ctx.body == 1) {
                await flowDynamic(MensajePreparcionAsistencia());
                await flowDynamic(HorarioAtencion());
            }
            if (ctx.body == 2) {
                await flowDynamic(HorarioAtencion());
            }
            
        }
        )
        
    const flowSoporteTecnico = addKeyword('3', {sensitive: true,})// ,'nube','renovar','renovacion','factura','facturacion','facturación','abono','transferir','vencio','venció','vencido','servicio','vencida'])
        .addAnswer(
            [
                /*
                'ACCESO AL FORO DE AYUDA:',
                '👉  https://goo.su/ZfYewA', // https://www.spegasoft.com/wp/community
                */
                'TUTORIALES DE YOUTUBE:',
                '👉 https://goo.su/4pEmLOw', //https://www.youtube.com/playlist?list=PLP6CdpxE4cnU2vsi0hHcYIOW7d-gfI43f
                '',
                '⚠ *TODOS LOS OPERADORES SE ENCUENTRAN OCUPADOS* ⚠',
                '',
                '_responde con la opcion numerica_',
                '1️⃣ NO IMPRIME',
                '2️⃣ NO FISCALIZA',
                '3️⃣ LA BALANZA NO PESA',
                '4️⃣ FUNCIONA LENTO',
                '5️⃣ NECESITO GENERAR/SACAR LISTADOS Ó INFORMES',
                '6️⃣ ME APARECE UN CARTEL DE ERROR',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
    
                if (![1, 2, 3, 4, 5, 6, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    await fallBack()
                    return
                }
            },
            [flowSalir,flowSoporteNoImprime,flowSoporteCartelError,flowSoporteBalanzaNoPesa,flowSoporteLento,flowSoporteInformes,flowSoporteInformes,flowSoporteNoFiscaliza]
        )
    
    const flowServicios = addKeyword('2', {sensitive: true,})// ,'nube','renovar','renovacion','factura','facturacion','facturación','abono','transferir','vencio','venció','vencido','servicio','vencida'])
        .addAnswer(
            [
                '$36.800 por servicio individual ya sea facturacion electronica o nube',
                '```Datos para transferencia:```',
                'Alias: spegasoft.emilia',
                'Emilia Benitez',
                '',
                'Por favor, junto al comprobante pasanos el CUIT de facturacion',
                '',
                '_Para mas opciones, responde con la opcion numerica_',
                '1️⃣ CONTRATAR FACTURACION',
                '2️⃣ CONTRATAR SONCRONIZACION DE PRECIOS',
                '3️⃣ RENOVAR SERVICIO',
                '4️⃣ INFORMAR PAGO',
                '',
                '9️⃣ SALIR'
            ],
            { capture: true },
            async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
                
                if (![1, 2, 3, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    await fallBack()
                    return
                }
            },
            [flowConsultarCuit,flowSalir,flowInformarPagos]
        )

    const flowPrecios = addKeyword('1', {sensitive: true,})
        .addAnswer(
            [
            'Licencia $73.700 unico pago por PC',
            'Facturacion Electronica $36.800 semestral por CUIT',
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
                '_responde con la opcion numerica_',
                '1️⃣ PRECIOS DE LICENCIAS', // PRECIOS
                '2️⃣ CONTRATAR Ó RENOVAR SERVICIO', // RENOVACION
                '',
                '9️⃣ SALIR' //SALIR
            ],
            { capture: true },
              async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            
                if (![1, 2, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                    await fallBack()
                    return
                }
            },
            [flowPrecios,flowServicios,flowSalir]
    );

    const flowVentas = addKeyword('1', {sensitive: true,})
        .addAnswer(
            [
              '_responde con la opcion numerica_',
              '1️⃣ PRECIOS', // PRECIOS
              '2️⃣ ASESORAMIENTO', // ASESORAMIENTO
              '',
              '9️⃣ SALIR',
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
        )

    const flowBienvenida = addKeyword(['hola','buen dia','buenos dias','buenos días','buenas tardes','buenas','buen día','buendia','problema','problemas','no funciona','no fiscaliza','no factura','contratar','comprar','comprarte','falla','error','anda lento','esta lento','funciona lento','funciona lenta'])
    .addAnswer(
        [
            'Gracias por comunicarse con *SpegaSoft*',
            'Soy 🤖 *TUERQUITA* Estoy aqui para brindarte informacion y guiarte en el proceso.',
            '_responde con la opcion numerica_',
            '1️⃣ VENTAS', // ADMINISTRACION Y SOPORTE
            '2️⃣ ADMINISTRACION', // VENTAS
            '3️⃣ SOPORTE TECNICO', //SOPORTE TECNICO
            '',
            '9️⃣ SALIR'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {

            if (![1, 2, 3, 9].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                //await flowDynamic(['Opcion no valida, por favor selecciona una opcion valida.'])
                await fallBack()
                return
            }
        },
        [flowSoporteTecnico,flowVentas,flowAdministracion,flowSalir]
    );    
    
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
            blackList: ['5492262479705'], //numeros a los que no responde
        }
    )
    QRPortalWeb()
}

main()
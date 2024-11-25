/*
    Intenté replicar lo que hizo el usuario sagmor en [https://github.com/sagmor/sii_chile],
    solo que para lenguaje javascript en un EXPRESS.js.
*/

//Seguiré editando esto según vaya avanzando en un proyecto personal
const fetch = require('node-fetch');
const cheerio = require('cheerio');//Tener instalado el cheerio es requisito [https://www.npmjs.com/package/cheerio]

async function fetchCaptcha() {
    /*Vemos que la página del SII maneja el código del captcha oculto en la misma página */
    const response = await fetch('https://zeus.sii.cl/cvc_cgi/stc/CViewCaptcha.cgi', {
        method: 'POST',
        body: new URLSearchParams({ oper: 0 }),
    });
    const dato = await response.json();
    const codigoCaptcha = atob(dato.txtCaptcha).substring(36, 40);
    /*Ya en este punto tenemos el codigo descifrado y listo para ser ingresado en los textbox de la página*/
    return { codigo: codigoCaptcha, captcha: dato.txtCaptcha };
}

async function fetchDatos(rut, dv) {
    try {
        const captcha = await fetchCaptcha();
        /*
        Aqui procedemos a ingresar el codigo del captcha descifrado,
        en conjunto con el rut y digito verificador
        */
        const response = await fetch('https://zeus.sii.cl/cvc_cgi/stc/getstc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                RUT: rut,
                DV: dv,
                PRG: 'STC',
                OPC: 'NOR',
                txt_code: captcha.codigo,
                txt_captcha: captcha.captcha
            }),
        });

        if (!response.ok) {
            throw new Error('Error en la consulta: ' + response.statusText);
        }
        /*
            La respuesta es la página completa, la cual la obtendremos por la libreria Cheerio,
            y la trabajaremos con ella.
        */
        const htmlResponse = await response.text();
        const $ = cheerio.load(htmlResponse);//Aqui hacemos el get de la página completa
        /*Desde aqui nos guiamos con los selector del html de la página según lo que necesitamos obtener */
        /*Revisar bien el tutorial de cheerio*/
        const actividades = [];//Esto lo usaremos para la lista de actividades
        const rows = $('table.tabla tr').slice(1);
        const razonSocial = $('body > div > div:nth-child(4)').text().trim();
        const fechaInicioActividad = $('span:contains("Fecha de Inicio de Actividades")')
            .text()
            .replace('Fecha de Inicio de Actividades:', '')
            .trim();
        const documentos = [];//Lo usaremos para la lista de los documentos
        let isDocumentos = false;//Con estas validaciones haremos "saltos" entre las filas de las tablas de la página

        for (let i = 0; i < rows.length; i++) {
            const node = rows[i];
            const td = $(node).find('td');

            if (td.length && $(td[0]).text().includes('Se recuerda que') || isDocumentos === false && $(td[0]).text().includes('Documento')) {
                isDocumentos = true;
                continue;
            }
            //Esto lo duplique por que lo usaré en otro momento
            if (td.length && $(td[0]).text().includes('Se recuerda que') || isDocumentos === false && $(td[0]).text().includes('Documento')) {
                isDocumentos = true;
                continue;
            }
            if (!isDocumentos) {
                //Llenamos la lista de actividades
                actividades.push({
                    giro: $(td[0]).text().trim(),
                    codigo: parseInt($(td[1]).text().trim(), 10),
                    categoria: $(td[2]).text().trim(),
                    afectaIVA: $(td[3]).text().trim().toLowerCase() === 'si',
                    fecha: $(td[4]).text().trim()
                });
            } else {
                if (td.length && $(td[0]).text().includes('Documento')) {
                    continue;
                }
                //Llenamos la lista de documentos
                documentos.push({
                    documento: $(td[0]).text().trim(),
                    anio_ult_timb: parseInt($(td[1]).text().trim(), 10)
                });
            }
        }

        return {
            /*
                Aqui ya devolvemos todo lo que hemos sacado para que lo usen los usuarios de la api
            */
            rut: `${rut}-${dv}`,
            razon_social: razonSocial,
            actividades: actividades,
            documentos: documentos,
            fechaInicioActividad: fechaInicioActividad
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function GET_TABLA_SII(req, res) {
    /*
        Esta es la entrada a la api
    */

    const { rut, dv } = req.query; 
    //Revisimos rut y digito verificador por separado
    if (!rut || !dv) {
        //Los validamos
        return res.status(400).json({ message: 'RUT y DV son requeridos' });
    }
    //Los enviamos al fetchDatos
    const dato = await fetchDatos(rut, dv);
    //Ya en este punto está todos los datos obtenidos
    if (dato) {
        console.log('dato', dato);
        res.json(dato);
    } else {
        /*
            -NOTA IMPORTANTE-
            A veces la consulta puede que falle, todavia no entiendo el porque,
            Asi que solo le puse en el front un "reintento" cada 5 segundos, hasta obtener los datos.
            Hasta la fecha no he tenido problemas.
        */
        res.status(500).json({ message: 'No se pudo obtener la información' });
    }
}

module.exports = {
    GET_TABLA_SII
};

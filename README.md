# sii_chile_valida_javascript

**Validación de datos públicos proporcionados por el Servicio de Impuestos Internos (SII) de Chile.**

En esta API usaremos **Express.js** para consultar los datos públicos disponibles desde el sitio oficial del SII [Consultar Situación Tributaria de Terceros](https://zeus.sii.cl/cvc/stc/stc.html)

## Descripción del Proyecto

Este proyecto es una adaptación del trabajo original creado por **Sebastián Gamboa** en su API desarrollada con lenguaje **Ruby**, disponible en https://github.com/sagmor/sii_chile.

### Cambios en esta versión:
- Reescritura completa en **JavaScript** usando **Node.js** y **Express.js**.

## Uso de la API

1. Realiza una consulta GET a la ruta principal del servicio, proporcionando un parámetro `rut`.
2. Ejemplo de uso en **JavaScript**:
    ```javascript
    fetch('http://localhost:8080/api/consulta?rut=12345647&dv=4')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```

### Respuesta esperada:
La API devuelve un objeto JSON con los datos consultados. Ejemplo:
```json
{
    "rut": "12.345.647-4",
    "razon_social": "Ejemplo Empresa",
    "actividades": [
        {
            "giro": "Comercio",
            "codigo": 12345,
            "categoria": "Afecto IVA",
            "afectaIVA": true,
            "fecha": "01-01-2000"
        }
    ],
    "documentos": [
        {
            "documento": "Factura Electrónica",
            "anio_ult_timb": 2023
        }
    ],
    "fechaInicioActividad": "01-01-2000"
}


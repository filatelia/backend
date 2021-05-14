const Monedas = require("../models/tienda/monedas");

const verificarCrearTodasMonedas = async () => {
    
    console.log("- Monedas aceptadas por Paypal.");
    console.log(" | Verificando existencia en BD Monedas.");

    var verificarExistenciaMonedas = await Monedas.find();
    if (verificarExistenciaMonedas.length != 0) {
    console.log("  | Monedas en BD OK.");


        
    }else{
    console.log("  | No se han encontrado Monedas en BD.");
    console.log("   | Creando Monedas en BD.");

    var monedasGuardadas = await Monedas.insertMany([
        {
          "nombreMoneda": "dólar australiano",
          "codigoMoneda": "AUD"
        },
        {
          "nombreMoneda": "Real brasileño 2",
          "codigoMoneda": "BRL"
        },
        {
          "nombreMoneda": "Dolar canadiense",
          "codigoMoneda": "CAD"
        },
        {
          "nombreMoneda": "Renmenbi chino 3",
          "codigoMoneda": "CNY"
        },
        {
          "nombreMoneda": "Corona checa",
          "codigoMoneda": "CZK"
        },
        {
          "nombreMoneda": "Corona danesa",
          "codigoMoneda": "DKK"
        },
        {
          "nombreMoneda": "Euro",
          "codigoMoneda": "EUR"
        },
        {
          "nombreMoneda": "Dolar de Hong Kong",
          "codigoMoneda": "HKD"
        },
        {
          "nombreMoneda": "Florín húngaro 1",
          "codigoMoneda": "HUF"
        },
        {
          "nombreMoneda": "Nuevo shekel israelí",
          "codigoMoneda": "ILS"
        },
        {
          "nombreMoneda": "Yenes japoneses 1",
          "codigoMoneda": "JPY"
        },
        {
          "nombreMoneda": "Ringgit malayo 3",
          "codigoMoneda": "MYR"
        },
        {
          "nombreMoneda": "Peso mexicano",
          "codigoMoneda": "MXN"
        },
        {
          "nombreMoneda": "Nuevo dólar taiwanés 1",
          "codigoMoneda": "TWD"
        },
        {
          "nombreMoneda": "Dolar de Nueva Zelanda",
          "codigoMoneda": "NZD"
        },
        {
          "nombreMoneda": "Corona noruega",
          "codigoMoneda": "NOK"
        },
        {
          "nombreMoneda": "Peso filipino",
          "codigoMoneda": "PHP"
        },
        {
          "nombreMoneda": "Zloty polaco",
          "codigoMoneda": "PLN"
        },
        {
          "nombreMoneda": "Libra esterlina",
          "codigoMoneda": "GBP"
        },
        {
          "nombreMoneda": "Rublo ruso",
          "codigoMoneda": "RUB"
        },
        {
          "nombreMoneda": "dolar de Singapur",
          "codigoMoneda": "SGD"
        },
        {
          "nombreMoneda": "Corona sueca",
          "codigoMoneda": "SEK"
        },
        {
          "nombreMoneda": "Franco suizo",
          "codigoMoneda": "CHF"
        },
        {
          "nombreMoneda": "Baht tailandés",
          "codigoMoneda": "THB"
        },
        {
          "nombreMoneda": "dólar de los Estados Unidos",
          "codigoMoneda": "USD"
        }
      ]);
    console.log("    | Se han creado "+monedasGuardadas.length+" Monedas en BD.");


    }
}

module.exports= {
    verificarCrearTodasMonedas
}
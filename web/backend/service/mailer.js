import nodemailer from "nodemailer";

export const mailer = {
  config: {
    host: "authsmtp.securemail.pro",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "valutazioni@istoremilano.com", // generated ethereal user
      pass: "Mustan2024+GW2024+", // generated ethereal password
    },
  },
  mail: {
    from: "valutazioni@istoremilano.com", // sender address
    to: "crivello.da@gmail.com,devmomo2016@gmail.com", // list of receivers
    subject: "Valutazione Effettuata!", // Subject line
    html: "", // html body
    attachments: [],
  },
  sendMailUtente: async function (id, email, prezzo, path, path2) {
    this.mail.html =
      "<html><head>    <style>        body {            font-family: Arial, sans-serif;            margin: 0;            padding: 0;        }        .container {            max-width: 600px;            margin: 0 auto;            padding: 20px;        }        .button {            display: inline-block;            background-color: #000000;            color: #ffffff;            padding: 10px 20px;            text-decoration: none;            border-radius: 4px;        }        .data-table {            border-collapse: collapse;            margin-top: 20px;        }        .data-table td,        .data-table th {            padding: 8px;            border: 1px solid #dddddd;        }        .data-table th {            background-color: #f9f9f9;            font-weight: bold;        }    </style></head>" +
      "<body>" +
      '<div class="container">' +
      "<p>Grazie per la richiesta ,</p>" +
      "<p>Il tuo codice valutazione è : " +
      id +
      "</p>" +
      "<p><u>In base alle informazioni ricevute</u>, la valutazione del tuo dispositivo è di " +
      prezzo.replaceAll('"', "") +
      "</p>" +
      "<p>Puoi concludere la procedura:</p>" +
      "<ul>" +
      "<li>Raggiungendoci in negozio per il pagamento immediato o per la permuta</li>" +
      "<li>Oppure chiedendo il <b>RITIRO GRATUITO</b> al tuo indirizzo</li>" +
      "</ul>" +
      "<p>In ogni caso, entro 48h verrete ricontattati per ricevere ulteriore assistenza e per ricevere il pagamento.</p>" +
      "<br>" +
      "<p>Per il ritiro gratuito non dovrai far altro che spedirci tu il dispositivo ed automaticamente alla tua valutazione avrà applicato un BONUS DI 10€ che ripaga i costi di spedizione del tuo dispositivo!</p>" +
      "<p>Abbiamo pensato questa soluzione perché molto spesso ci è capitato che il corriere non passasse all’orario indicato dal cliente, dovendo richiedere più volte il ritiro della spedizione in giorni ed orari sempre diversi.</p>" +
      "<p>In questo modo sarete voi a decidere quando e come spedire il dispositivo che volete vendere. Noi consigliamo solamente l’utilizzo di un buon corriere (BRT e UPS sono i migliori, EVITA SDA o INPOST) e di impacchettare correttamente il dispositivo.</p>" +
      "<p>Puoi richiedere in pochi click il ritiro al suo domicilio tramite portali online per la spedizione tipo Packlink o Pacco Facile, acquistare l’etichetta e programmare il ritiro a casa sua con la spedizione e i dati che le forniamo di seguito.</p>" +
      "<table>" +
      "<tr><td>iStore Milano</td><td>Piazza Argentina 1, 20124 Milano (MI)</td></tr>" +
      "<tr><td>N. di telefono:</td><td>3317359139</td></tr>" +
      '<tr><td>Mail:</td><td><a href="mailto:info@istoremilano.com">info@istoremilano.com</a></td></tr>' +
      "</table>" +
      "<p>Restiamo a disposizione per qualsiasi dubbio o domanda.</p>" +
      "<p>Buona giornata</p>" +
      '<p><a href="http://www.istoremilano.com">www.istoremilano.com</a></p>' +
      '<p><a href="http://www.instagram.com/istoremilano/">www.instagram.com/istoremilano/</a></p>' +
      '<p><a href="http://www.tiktok.com/@istoremilano/">www.tiktok.com/@istoremilano/</a></p>' +
      '<p><a href="mailto:info@istoremilano.com">info@istoremilano.com</a></p>';

    this.mail.attachments = [
      {
        filename: "foto_fronte.jpg",
        path: path,
      },
      {
        filename: "foto_retro.jpg",
        path: path2,
      },
    ];
    this.mail.from = "no-reply@istoremilano.com";
    this.mail.subject = "Valutazione Effettuata!";
    try {
      this.mail.to = email;
      let transporter = await this.init();
      let info = await transporter.sendMail(this.mail);
    } catch (error) {
      console.log(error);
    }
  },
  sendMailNegozio: async function (
    id,
    email,
    nome,
    prezzo,
    telefono,
    imei,
    modello,
    stato_schermo,
    stato_batteria,
    stato_estetico,
    accessorio,
    path,
    path2
  ) {
 

    this.mail.html =
      "<html><head>    <style>        body {            font-family: Arial, sans-serif;            margin: 0;            padding: 0;        }        .container {            max-width: 600px;            margin: 0 auto;            padding: 20px;        }        .button {            display: inline-block;            background-color: #000000;            color: #ffffff;            padding: 10px 20px;            text-decoration: none;            border-radius: 4px;        }        .data-table {            border-collapse: collapse;            margin-top: 20px;        }        .data-table td,        .data-table th {            padding: 8px;            border: 1px solid #dddddd;        }        .data-table th {            background-color: #f9f9f9;            font-weight: bold;        }    </style></head>" +
      "<body>" +
      '<div class="container">' +
      "<h2>Valutazione n° " +
      id +
      " di " +
      nome +
      "</h2>" +
      '<table class="data-table"><tr><th>Dettagli dispositivo</th><th>Dati inseriti</th></tr>' +
      "<tr><td>Nome cliente:</td><td>" +
      nome +
      "</td></tr>" +
      "<tr><td>Email cliente:</td><td>" +
      email +
      "</td></tr>" +
      "<tr><td>Telefono:</td><td>" +
      telefono +
      "</td></tr>" +
      "<tr><td>Modello del dispositivo:</td><td>" +
      modello +
      "</td></tr>" +
      "<tr><td>IMEI:</td><td>" +
      imei +
      "</td></tr>" +
      "<tr> <td>Stato del dispositivo:</td><td>" +
      stato_estetico +
      "</td></tr>" +
      "<tr> <td>Stato della batteria:</td><td>" +
      stato_batteria +
      "%</td></tr>" +
      "<tr> <td>Stato del Display:</td><td>" +
      stato_schermo +
      "</td></tr>" +
      "<tr><td>Accessori e Prova di acquisto:</td><td>" +
      accessorio +
      "</td></tr>" +
      "<tr><td>Prezzo</td><td>" +
      prezzo.replace('"', "") +
      "</td></tr>";

    this.mail.attachments = [
      {
        filename: "foto_fronte.jpg",
        path: path,
      },
      {
        filename: "foto_retro.jpg",
        path: path2,
      },
    ];
    this.mail.subject = "Valutazione di " + nome;
    try {
      this.mail.to = "valutazioni@istoremilano.com";
      let transporter = await this.init();
      console.log(this.mail.html); // Log the email body content
      await transporter.sendMail(this.mail);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email: ", error);
    }

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
  },

  sendMailValuta: async function (
    id,
    email,
    nome,
    prezzo,
    telefono,
    imei,
    modello,
    stato_schermo,
    stato_batteria,
    stato_estetico,
    accessorio,
    path,
    path2
  ) {
    this.mail.html = `
      <p>Gentile <b>${nome}</b>,</p>
      
      <p>Abbiamo elaborato con successo la tua valutazione!</p>
  
      <p><b>Ordine creato per la valutazione ID:</b> ${id}</p>
      <p><b>Modello:</b> ${modello}</p>
      <p><b>Accessori:</b> ${accessorio}</p>
      <p><b>IMEI:</b> ${imei}</p>
      <p><b>Stato Batteria:</b> ${stato_batteria}</p>
      <p><b>Stato Estetico:</b> ${stato_estetico}</p>
      <p><b>Stato Schermo:</b> ${stato_schermo}</p>
      <p><b>Prezzo:</b> ${prezzo}</p>
  
      <p>Per il ritiro gratuito non dovrai far altro che spedirci tu il dispositivo ed automaticamente la tua valutazione sarà maggiorata di un BONUS di 10€ che ripaga in eccesso i costi di spedizione del tuo dispositivo!</p>
  
      <p>Abbiamo pensato questa soluzione perché molto spesso ci è capitato che il corriere non passasse all’orario indicato dal cliente, dovendo richiedere più volte il ritiro della spedizione in giorni ed orari sempre diversi.</p>
  
      <p>In questo modo sarete voi a decidere quando e come spedire il dispositivo che volete vendere. Noi consigliamo solamente l’utilizzo di un buon corriere (BRT e UPS sono i migliori, EVITA SDA o INPOST) e di impacchettare correttamente il dispositivo.</p>
  
      <p>Puoi richiedere in un paio di click il ritiro al suo domicilio tramite portali online per la spedizione tipo Packlink o Pacco Facile, dovrai semplicemente acquistare l’etichetta programmando il ritiro a casa sua con la spedizione e i dati che le forniamo di seguito.</p>
  
      <p>Stamperà poi la lettera di vettura (LDV) che le verrà fornita dal servizio che sceglie e la dovrà attaccare al pacco.</p>
  
      <p><b>I dati della spedizione sono i seguenti:</b></p>
      <p><b>iStore Milano</b></p>
      <p><b>Piazza Argentina 1, 20124 Milano (MI)</b></p>
      <p><b>N. di telefono:</b> 3317359139</p>
      <p><b>Mail:</b> info@istoremilano.com</p>
  
      <p>Restiamo a disposizione per qualsiasi dubbio o domanda.</p>
  
      <p>Buona giornata,</p>
  
      <p>info@istoremilano.com</p>
      <p>www.istoremilano.com</p>
      <p>www.instagram.com/istoremilano/</p>
      <p>www.tiktok.com/@istoremilano/</p>
    `;

    this.mail.attachments = [
      {
        filename: "foto_fronte.jpg",
        path: path,
      },
      {
        filename: "foto_retro.jpg",
        path: path2,
      },
    ];
  },

  init: async function () {
    let transporter = nodemailer.createTransport(this.config);
    return transporter;
  },
};

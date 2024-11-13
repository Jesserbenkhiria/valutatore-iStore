import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "authsmtp.securemail.pro",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "valutazioni@istoremilano.com", // generated ethereal user
    pass: "Mustan2024+GW2024+", // generated ethereal password
  },
  debug: true,
  logger: true,
});

const valutaEmail = (content, id, include) => {
  console.log(content, id);
  console.log("here", content, id);
  const first = include
    ? "Abbiamo elaborato con successo la tua valutazione!"
    : "Abbiamo rettificato la tua valutazione con i valori corrispondenti al dispositivo valutato.";
  const mailOptions = {
    from: "valutazioni@istoremilano.com",
    to: content.email,
    subject: "Valutazione Effettuata!",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <p style="font-size: 18px; color: #333;">Gentile <b>${content.nome}</b>,</p>
    
        <p>${first}</p>

        <p><b>Ordine creato per la valutazione ID:</b> ${id}</p>
        <p><b>Modello:</b> ${content.modello}</p>
        <p><b>Accessori:</b> ${content.accessori}</p>
        <p><b>IMEI:</b> ${content.imei}</p>
        <p><b>Stato Batteria:</b> ${content.stato_batteria}</p>
        <p><b>Stato Estetico:</b> ${content.stato_estetico}</p>
        <p><b>Stato Schermo:</b> ${content.stato_schermo}</p>
        <p><b>Prezzo:</b> ${content.prezzo}</p>

        <p style="margin-top: 20px;">Per il ritiro gratuito non dovrai far altro che spedirci tu il dispositivo ed automaticamente la tua valutazione sarà maggiorata di un BONUS di 10€ che ripaga in eccesso i costi di spedizione del tuo dispositivo!</p>

        <p>Abbiamo pensato questa soluzione perché molto spesso ci è capitato che il corriere non passasse all’orario indicato dal cliente, dovendo richiedere più volte il ritiro della spedizione in giorni ed orari sempre diversi.</p>

        <p>In questo modo sarete voi a decidere quando e come spedire il dispositivo che volete vendere. Noi consigliamo solamente l’utilizzo di un buon corriere (BRT e UPS sono i migliori, EVITA SDA o INPOST) e di impacchettare correttamente il dispositivo.</p>

        <p>Puoi richiedere in un paio di click il ritiro al suo domicilio tramite portali online per la spedizione tipo Packlink o Pacco Facile, dovrai semplicemente acquistare l’etichetta programmando il ritiro a casa sua con la spedizione e i dati che le forniamo di seguito.</p>

        <p>Stamperà poi la lettera di vettura (LDV) che le verrà fornita dal servizio che sceglie e la dovrà attaccare al pacco.</p>

        <p><b>I dati della spedizione sono i seguenti:</b></p>
        <p><b>iStore Milano</b><br>Piazza Argentina 1, 20124 Milano (MI)<br>N. di telefono: 3317359139<br>Mail: info@istoremilano.com</p>
        <p>Il pagamento avviene tramite Bonifico, entro 72h dalla ricezione e verifica del dispositivo.</p>

        <p style="margin-top: 20px;">Restiamo a disposizione per qualsiasi dubbio o domanda.</p>

        <p>Buona giornata,</p>
        <p>info@istoremilano.com<br><a href="https://www.istoremilano.com" style="color: #0056b3; text-decoration: none;">www.istoremilano.com</a><br>
           <a href="https://www.instagram.com/istoremilano/" style="color: #0056b3; text-decoration: none;">www.instagram.com/istoremilano/</a><br>
           <a href="https://www.tiktok.com/@istoremilano/" style="color: #0056b3; text-decoration: none;">www.tiktok.com/@istoremilano/</a>
        </p>
      </div>
    </div>
  `,
    attachments: [
      {
        filename: "foto_fronte.jpg",
        path: content.path,
      },
      {
        filename: "foto_retro.jpg",
        path: content.path2,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};
export default valutaEmail;

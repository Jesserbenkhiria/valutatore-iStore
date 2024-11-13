import shopify from "./shopify.js";
import { ValutazioneRepository } from "../repository/valutazione.js";

export const orderCreator = async function (valutazione, session) {
  const update = valutazione.idOrdineShopify ? true : false;

  try {
    if (valutazione.valutato === false) {
      return;
    }
    console.log("Inizio");

    // Parsing valutazione content
    const valutazioneData = JSON.parse(valutazione.content);

    let product, order, customer;
    // Search for the customer by phone
    const phoneQuery = valutazioneData.telefono.startsWith('+') ? valutazioneData.telefono : '+39' + valutazioneData.telefono;
    let customers = await shopify.api.rest.Customer.search({
      session: session,
      query: `phone:${phoneQuery}`
    });

    if (customers.customers.length === 0) {
      // If no customer found by phone, search by email
      customers = await shopify.api.rest.Customer.search({
        session: session,
        query: `email:${valutazioneData.email}`
      });
    }

    if (customers.customers.length > 0) {
      customer = customers.customers[0];
      console.log("Cliente esistente trovato:", customer);
    } else {
      // If no customer is found, create a new one
      customer = new shopify.api.rest.Customer({ session });
      customer.first_name = valutazioneData.name;
      customer.email = valutazioneData.email;
      customer.phone = phoneQuery;
      customer.addresses = [
        {
          address1: valutazioneData.indirizzo,
        },
      ];
      await customer.save({update:true});
      await sleep(300);
      console.log("Nuovo cliente creato:", customer);
    }

    // Retrieve existing order if valutazione.idOrdineShopify is present
    if (valutazione.idOrdineShopify) {
      order = await shopify.api.rest.Order.find({session : session, id:valutazione.idOrdineShopify});
      if (order && order.line_items.length > 0) {
        const lineItem = order.line_items[0];
        if (lineItem && lineItem.product_id) {
          // Retrieve existing product
          product = await shopify.api.rest.Product.find({session : session, id:lineItem.product_id});
        }
      }
    }

    if (!product) {
      // Create new product if it doesn't exist
      product = new shopify.api.rest.Product({ session });
      product.title = `${valutazioneData.modello} - ${valutazioneData.nome}`;
      product.body_html = `
        <strong>Modello:</strong> ${valutazioneData.modello}<br>
        <strong>Accessori:</strong> ${valutazioneData.accessori}<br>
        <strong>IMEI:</strong> ${valutazioneData.imei}<br>
        <strong>Stato Batteria:</strong> ${valutazioneData.stato_batteria}%<br>
        <strong>Stato Estetico:</strong> ${valutazioneData.stato_estetico}<br>
        <strong>Stato Schermo:</strong> ${valutazioneData.stato_schermo}
      `;
      product.vendor = "Valutazione";
      product.product_type = "Usato";
      product.tags = "valutazione";
      product.status = "archived";
    
      product.images = valutazioneData.urlImg ? [{ src: valutazioneData.urlImg }] : [];

      await product.save({
        update: true,
      });

    } else {
      // Update existing product
      product.title = `${valutazioneData.modello} - ${valutazioneData.nome}`;
      product.body_html = `
        <strong>Modello:</strong> ${valutazioneData.modello}<br>
        <strong>Accessori:</strong> ${valutazioneData.accessori}<br>
        <strong>IMEI:</strong> ${valutazioneData.imei}<br>
        <strong>Stato Batteria:</strong> ${valutazioneData.stato_batteria}%<br>
        <strong>Stato Estetico:</strong> ${valutazioneData.stato_estetico}<br>
        <strong>Stato Schermo:</strong> ${valutazioneData.stato_schermo}
      `;
    
      product.images = valutazioneData.urlImg ? [{ src: valutazioneData.urlImg }] : [];
    
      await product.save({
        update: true,
      });
    }
    console.log(product);
    
    await sleep(1000);

    const newUpdateOrder = new shopify.api.rest.Order({ session });
    newUpdateOrder.id = valutazione.idOrdineShopify || null;

    newUpdateOrder.line_items = [
      {
        "variant_id": product.variants[0].id,
        "quantity": 1
      }
    ];
    newUpdateOrder.email = customer.email;
    newUpdateOrder.fulfillment_status = "fulfilled";
    newUpdateOrder.tags = "Valutazione";
    newUpdateOrder.note =  `Ordine creato per la valutazione ID: ${valutazione.id} ` + (valutazioneData.note ? valutazioneData.note : "") + `
    \nModello: ${valutazioneData.modello}
    \nAccessori: ${valutazioneData.accessori}
    \nIMEI: ${valutazioneData.imei}
    \nStato Batteria: ${valutazioneData.stato_batteria}%
    \nStato Estetico: ${valutazioneData.stato_estetico}
    \nStato Schermo: ${valutazioneData.stato_schermo}
    \nPrezzo: ${valutazioneData.prezzo}
  `;

    newUpdateOrder.customer = {
      id: customer.id, // Assign the existing or new customer ID to the order
    };

    // Salvataggio dell'ordine e gestione della risposta
    await newUpdateOrder.save({ update: true });
    await sleep(300);
    console.log("Ordine " +(!update ? "creato ":"aggiornato ")+ "con successo", newUpdateOrder.id);

    // Aggiornamento dell'ID ordine Shopify nella valutazione
    await ValutazioneRepository.updateIdOrdine(valutazione.id, newUpdateOrder.id);
  } catch (error) {
    console.error("Errore durante "+( !update ? "la creazione ":"l'aggiornamento ")+"del prodotto:", error);
  }
  console.log("Fine "+(update ? "aggiornamento " : "creazione ")+"Ordine")
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
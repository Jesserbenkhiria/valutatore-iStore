import axios from "axios";
import ValutazioneController from "../controller/valutazioneController.js";
import valutaEmail from "./emailSender.js";
import { mailer } from "./mailer.js";

export const subscriber = {
  apiToken: "pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
  checkIfUserExistsInTheSegment: async (listId, profileId) => {
    const url = `https://a.klaviyo.com/api/profiles/${profileId}/lists`;
    const headers = {
      revision: "2024-10-15",
      Authorization: "Klaviyo-API-Key pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
      "Content-Type": "application/json",
    };

    let retries = 0;
    const maxRetries = 5; // Maximum number of retries
    const retryDelay = 1000; // Starting delay time in milliseconds

    const makeRequest = async () => {
      try {
        // Sending the request
        const response = await axios.get(url, { headers });

        // Check if the listId exists in the response data
        if (response) {
          const listExists = response.data.data.some(
            (item) => item.id === listId
          );
          if (listExists) {
            return true;
          } else {
            return false;
          }
        }
      } catch (error) {
        if (error.response) {
          // Check if the error is due to rate-limiting (HTTP 429)
          if (error.response.status === 429) {
            console.log("Rate limit exceeded, retrying...");
            if (retries < maxRetries) {
              retries++;
              const backoffTime = retryDelay * Math.pow(2, retries); // Exponential backoff
              console.log(`Retrying in ${backoffTime} ms...`);
              await new Promise((resolve) => setTimeout(resolve, backoffTime)); // Wait before retrying
              return makeRequest(); // Retry the request
            } else {
              console.error(
                "Maximum retries reached. Unable to complete the request."
              );
              return false; // Max retries reached, stop retrying
            }
          }
        }

        // Logging the error if not rate-limiting
        console.error("Error fetching data:", error.message);
        return false;
      }
    };

    return await makeRequest();
  },

  addProfileToList: async (listId, profileId) => {
    const url = `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles`;
    const headers = {
      revision: "2024-10-15",
      Authorization: "Klaviyo-API-Key pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
      "Content-Type": "application/json",
    };
    const data = {
      data: [
        {
          type: "profile",
          id: profileId,
        },
      ],
    };
    const isExiste = await subscriber.checkIfUserExistsInTheSegment(
      listId,
      profileId
    );

    if (!isExiste) {
      try {
        const response = await axios.post(url, data, { headers });
        console.log("Profile added to list successfully", response.data);
        return true;
      } catch (error) {
        console.log("Erreur while adding");
        return false;
      }
    } else {
      console.error("user already existe in this liste", listId);
      return false;
    }
  },

  confermaValutazione: async function (valutazioneContent) {
    // console.log(valutazioneContent);

    const listaID = "WcEckL"; // Replace with the correct Klaviyo list ID
    const parsedBody = JSON.parse(valutazioneContent);

    try {
      const postData = {
        data: {
          type: "profile",
          attributes: {
            email: parsedBody.email,
            properties: {
              first_name: parsedBody.nome,
              last_name: parsedBody.nome,
              phone_number: parsedBody.telefono,
            },
          },
        },
      };

      const config = {
        headers: {
          revision: "2024-10-15",
          Authorization:
            "Klaviyo-API-Key pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
          "Content-Type": "application/json", // Specify content type
        },
      };

      const res = await axios.post(
        "https://a.klaviyo.com/api/profiles",
        postData,
        config
      );

      if (res.data.data.id) {
        console.log("iddd", res.data.data.id);
        const added = await this.addProfileToList(listaID, res.data.data.id);
        if (added) {
          console.log("emaail will be sent");
          valutaEmail(parsedBody, parsedBody.id, true);
        }
      }
    } catch (error) {
      let userId = error.response.data.errors[0].meta.duplicate_profile_id;
      const added = await this.addProfileToList(listaID, userId);
      if (added) {
        console.log("emaail will be sent");
        valutaEmail(parsedBody, parsedBody.id, true);
      }
    }
  },

  richiestaValutazione: async function (valutazioneContent, id) {
    const listaID = "Uif8Fv"; // Replace with the correct Klaviyo list ID
    const parsedBody = JSON.parse(valutazioneContent);
    try {
      const postData = {
        data: {
          type: "profile",
          attributes: {
            email: parsedBody.email,
            properties: {
              first_name: parsedBody.nome,
              last_name: parsedBody.nome,
              phone_number: parsedBody.telefono,
            },
          },
        },
      };

      const config = {
        headers: {
          revision: "2024-10-15",
          Authorization:
            "Klaviyo-API-Key pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
          "Content-Type": "application/json", // Specify content type
        },
      };

      const res = await axios.post(
        "https://a.klaviyo.com/api/profiles",
        postData,
        config
      );

      if (res.data.data.id) {
        const added = await this.addProfileToList(listaID, res.data.data.id);
        if (added) {
          console.log("emaailsssssss will be sent", listaID);

          await mailer.sendMailUtente(
            id,
            parsedBody.email,
            parsedBody.prezzo,
            parsedBody.urlImg,
            parsedBody.urlImg
          );
          console.log("emaailsssssss will be sent second", listaID);

          await mailer.sendMailNegozio(
            id,
            parsedBody.email,
            parsedBody.nome,
            parsedBody.prezzo,
            parsedBody.telefono,
            parsedBody.imei,
            parsedBody.modello,
            parsedBody.stato_schermo,
            parsedBody.stato_batteria,
            parsedBody.stato_estetico,
            parsedBody.accessori,
            parsedBody.urlImg,
            parsedBody.urlImg
          );
        }
      } else {
        console.log("user exist");
      }
    } catch (error) {
      let userId = error.response.data.errors[0].meta.duplicate_profile_id;
      const added = await this.addProfileToList(listaID, userId);
      if (added) {
        console.log("emaailsssssss will be sent", listaID);
        await mailer.sendMailUtente(
          id,
          parsedBody.email,
          parsedBody.prezzo,
          parsedBody.urlImg,
          parsedBody.urlImg
        );
        console.log("emaailsss will be sent second", listaID);
        await mailer.sendMailNegozio(
          id,
          parsedBody.email,
          parsedBody.nome,
          parsedBody.prezzo,
          parsedBody.telefono,
          parsedBody.imei,
          parsedBody.modello,
          parsedBody.stato_schermo,
          parsedBody.stato_batteria,
          parsedBody.stato_estetico,
          parsedBody.accessori,
          parsedBody.urlImg,
          parsedBody.urlImg
        );
        console.log("emaail will be sent", listaID);
      }
    }
  },
  verifyValutazioneSub: async function () {
    console.log("start");

    try {
      const list = await ValutazioneController.privateController.listOfVal();
      let count = 0;
      // Loop over each valutazione item
      for (const valutazione of list) {
        try {
          // // Call richiestaValutazione with the parsed content
          if (valutazione.valutato) {
            count++;
            await this.confermaValutazione(valutazione.content);
          } else {
            await this.richiestaValutazione(
              valutazione.content,
              valutazione.id
            );
          }
        } catch (parseError) {
          console.error("Error parsing content:", parseError);
        }
      }
      console.log(count);

      console.log("All requests processed.");
    } catch (error) {
      console.error("Error processing valuation requests:", error);
    }
  },
};

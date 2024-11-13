import axios from "axios";
import ValutazioneController from "../controller/valutazioneController.js";

export const subscriber = {
  apiToken: "pk_ef1d9f93a6520e3f998e2a9aed47cac3dd",
  getEmail: async function (valutazioneContent) {
    // console.log("The parsed email content:", parsedBody);
    return parsedBody.email;
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

    try {
      const response = await axios.post(url, data, { headers });
      console.log("Profile added to list successfully:", response.data);
    } catch (error) {
      console.error("Error adding profile to list:", error.response.data);
    }
  },
  confermaValutazione: async function (valutazioneContent) {
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
        this.addProfileToList(listaID, res.data.data.id);
      } else {
        console.log("user exist");
      }
    } catch (error) {
      console.log(error.response.data.errors[0].detail);
      console.log(error.response.data.errors[0].detail);
      let userId = error.response.data.errors[0].meta.duplicate_profile_id;
      console.log(error.response.data.errors[0].meta.duplicate_profile_id);
      this.addProfileToList(listaID, userId);
    }
  },
  richiestaValutazione: async function (valutazioneContent) {
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
        this.addProfileToList(listaID, res.data.data.id);
      } else {
        console.log("user exist");
      }
    } catch (error) {
      console.log(error.response.data.errors[0].detail);
    }
  },
  verifyValutazioneSub: async function () {
    try {
      const list = await ValutazioneController.privateController.listOfVal();
      let count = 0;
      // Loop over each valutazione item
      for (const valutazione of list) {
        try {
          // // Call richiestaValutazione with the parsed content
          if (valutazione.valutato) {
            count++;
            console.log(valutazione);
          await this.confermaValutazione(valutazione.content);

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

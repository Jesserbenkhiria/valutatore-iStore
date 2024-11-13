import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const imeiResults = {
  create: async function (data) {
    console.log(data);
    try {
      // Check if imei already exists
      const existingImei = await this.findOneByImei(data.imei);
      if (existingImei.found) {
        return `IMEI ${data.imei} already exists.`;
      }

      // Create a new checkedIMEI record in the database
      const result = await prisma.checkedIMEI.create({
        data:{
          imei: data.imei,
          balance: data.balance * 1,
          price: data.price * 1,
          service: data.service,
          status: data.status,
          manufacturer: data.Manufacturer,
          modelCode: data["Model Code"],
          modelName: data["Model Name"],
          valutazioni: {
            connect: { id: data.id } // Use connect to reference the existing valutazioni record
          }
        }});

      // Return the ID of the newly created record
      return result.id;
    } catch (error) {
      console.error("Error creating checkedIMEI record:", error);
      throw error;
    }
  },
  findOneByImei: async function (imei) {
    try {
      // Query for a single checkedIMEI record by imei
      const foundImei = await prisma.checkedIMEI.findUnique({
        where: {
          imei: imei,
        },
      });
      if (foundImei) {
        return {found:true, data:foundImei};
      } else {
        return {found:false, data:{}};;
      } // Return the found record or null if not found
    } catch (error) {
      console.error("Error finding checkedIMEI by imei:", error);
      throw error;
    }
  },
};

import { Op } from "sequelize";
import { ClientModel } from "../models/client_model.js";
import { UserModel } from "../models/user_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";

export const addClient = async (req, res, next) => {
  try {
    const { companyname, contactperson, email, phone, address, status } =
      req.body;

    const requiredFields = {
      companyname,
      contactperson,
      email,
      phone,
      address,
    };

    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw new ApiErrorResponse(`${fieldName} is required`, 400);
      }
    }

    const alreadyExists = await ClientModel.findOne({
      where: {
        [Op.or]: [{ phone }, { email }],
      },
    });

    if (alreadyExists) {
      throw new ApiErrorResponse(
        "Client with same email or phone already exists",
        400,
      );
    }

    const client = await ClientModel.create({
      companyname,
      contactperson,
      email,
      phone,
      address,
      status: status || "Active",
      createdby: req.user.userid,
    });

    if (client) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 201,
          message: "Client added successfully",
          data: client.clientid,
        }),
      );
    }
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const {
      clientid,
      companyname,
      contactperson,
      email,
      phone,
      address,
      status,
    } = req.body;

    if (!clientid) {
      throw new ApiErrorResponse("clientid is required");
    }

    const existingClient = await ClientModel.findOne({
      where: {
        clientid: parseInt(clientid),
        createdby: req.user?.userid
      },
    });

    if (!existingClient) {
      throw new ApiErrorResponse("Client not found or you don't have permission to edit it", 404);
    }

    await ClientModel.update(
      {
        companyname: companyname || existingClient.companyname,
        contactperson: contactperson || existingClient.contactperson,
        email: email || existingClient.email,
        phone: phone || existingClient.phone,
        address: address || existingClient.address,
        status: status || existingClient.status,
      },
      {
        where: {
          clientid,
          createdby: req.user?.userid
        },
      },
    );

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Client updated successfully",
        data: parseInt(clientid),
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const listClient = async (req, res, next) => {
  try {
    const admin = await UserModel.findByPk(req.user.userid);
    if (!admin) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const clients = await ClientModel.findAll();
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Clients fetched successfully",
        data: clients ?? [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { clientid } = req.body;

    if (!clientid) {
      throw new ApiErrorResponse("clientid is required", 400);
    }

    const client = await ClientModel.findOne({
      where: {
        clientid,
        createdby: req.user?.userid
      },
    });

    if (!client) {
      throw new ApiErrorResponse("Client not found", 404);
    }

    await client.destroy();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Client deleted successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};


export const updateClientStatus = async (req, res, next) => {
  try {
    const { clientid } = req.body;

    if (!clientid) {
      throw new ApiErrorResponse("Client ID is required", 400);
    }

    const client = await ClientModel.findByPk(clientid);

    if (client) {
      client.status = req.body.status;
      await client.save();

      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Client status updated successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Client not found ", 404);
  } catch (error) {
    next(error);
  }
};

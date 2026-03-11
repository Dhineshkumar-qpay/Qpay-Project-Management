import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../models/project_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { EmployeeModel } from "../models/employee_model.js";
import { ClientModel } from "../models/client_model.js";

export const addProject = async (req, res, next) => {
  try {
    const requiredFields = [
      "projectname",
      "clientid",
      "description",
      "startdate",
      "enddate",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiErrorResponse(`${field} is required`, 400);
      }
    }

    const project = await ProjectModel.create({
      ...req.body,
      createdby: req.user.userid,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Project added successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { projectid } = req.body;

    if (!projectid) {
      throw new ApiErrorResponse("projectid is required", 400);
    }
    const existingProject = await ProjectModel.findOne({
      where: {
        projectid,
        createdby: req.user?.userid,
      },
    });

    if (!existingProject) {
      throw new ApiErrorResponse(
        "Project not found or you don't have permission to edit it",
        404,
      );
    }

    await ProjectModel.update(
      {
        projectname: req.body.projectname ?? existingProject.projectname,
        clientid: req.body.clientid ?? existingProject.clientid,
        description: req.body.description ?? existingProject.description,
        priority: req.body.priority ?? existingProject.priority,
        startdate: req.body.startdate ?? existingProject.startdate,
        enddate: req.body.enddate ?? existingProject.enddate,
        updatedby: req.user?.userid,
      },
      {
        where: { projectid: projectid },
      },
    );

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Project updated successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { status } = req.body;
    const whereFunctions = {};

    if (status) {
      whereFunctions.status = status;
    }

    const projects = await ProjectModel.findAll({
      where: whereFunctions,
      attributes: { exclude: ["clientid"] },
      include: {
        model: ClientModel,
        attributes: ["clientid", "contactperson"],
      },
      raw: true,
      nest: true,
    });

    const formattedProjects = projects.map((proj) => ({
      ...proj,
      clientid: proj.ClientModel?.clientid ?? null,
      contactperson: proj.ClientModel?.contactperson ?? "",
      clientname: "",
      ClientModel: undefined,
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedProjects ?? [],
      }),
    );
  } catch (error) {
    next(error);
  }
};
export const deleteProject = async (req, res, next) => {
  try {
    const { projectid } = req.body;

    if (!projectid) {
      throw new ApiErrorResponse("Project ID is required", 400);
    }

    const existingProject = await ProjectModel.findOne({
      where: {
        projectid,
        createdby: req.user?.userid,
      },
    });

    if (!existingProject) {
      throw new ApiErrorResponse("Project not found", 404);
    }

    const assignmentExists = await AssignProjectModel.findOne({
      where: { projectid },
    });

    if (assignmentExists) {
      throw new ApiErrorResponse(
        "Project cannot be deleted. Assignments are linked to this project.",
        400,
      );
    }

    const moduleExists = await ProjectModule.findOne({
      where: { projectid },
    });

    if (moduleExists) {
      throw new ApiErrorResponse(
        "Project cannot be deleted. Modules are linked to this project.",
        400,
      );
    }

    await ProjectModel.destroy({
      where: { projectid },
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Project deleted successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateProjectStatus = async (req, res, next) => {
  try {
    const project = await ProjectModel.findByPk(req.body.projectid);

    if (project) {
      project.status = req.body.status;
      await project.save();
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Project updated sucessfully",
        }),
      );
    }
    throw new ApiErrorResponse("Project not found", 404);
  } catch (error) {
    next(error);
  }
};

/*  -------------------- Project Module ----------------------- */

export const addProjectModule = async (req, res, next) => {
  try {
    const requiredFields = ["projectid", "modulename", "description"];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiErrorResponse(`${field} is required`, 400);
      }
    }
    const module = await ProjectModule.create({
      projectid: req.body.projectid,
      modulename: req.body.modulename,
      description: req.body.description,
      createdby: req.user.userid,
    });
    if (module) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Module added successfully",
        }),
      );
    }

    throw new ApiErrorResponse("Failed to add module", 400);
  } catch (error) {
    next(error);
  }
};

export const updateProjectModule = async (req, res, next) => {
  try {
    const { moduleid, projectid, modulename, description } = req.body;

    if (!moduleid) {
      throw new ApiErrorResponse("moduleid is required", 400);
    }

    if (!projectid) {
      throw new ApiErrorResponse("projectid is required", 400);
    }

    if (!modulename || !modulename.trim()) {
      throw new ApiErrorResponse("Modulename is required", 400);
    }

    const existingProject = await ProjectModel.findByPk(projectid);
    if (!existingProject) {
      throw new ApiErrorResponse("Project not found", 404);
    }

    const existingModule = await ProjectModule.findOne({
      where: {
        moduleid,
        createdby: req.user?.userid,
      },
    });
    if (!existingModule) {
      throw new ApiErrorResponse(
        "Module not found or you don't have permission to edit it",
        404,
      );
    }

    const [updatedRows] = await ProjectModule.update(
      {
        projectid,
        modulename,
        description,
        updatedby: req.user?.userid,
      },
      {
        where: { moduleid },
      },
    );

    if (updatedRows > 0) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Module updated successfully",
        }),
      );
    }

    throw new ApiErrorResponse("Failed to update module", 400);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectModule = async (req, res, next) => {
  try {
    const deleteProductModule = await ProjectModule.destroy({
      where: {
        createdby: req.user.userid,
        projectid: req.body.projectid,
        moduleid: req.body.moduleid,
      },
    });
    if (!deleteProductModule) {
      throw new ApiErrorResponse("ProjectModule not found", 404);
    }
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "ProjectModule deleted sucessfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getProjectModules = async (req, res, next) => {
  try {
    const modules = await ProjectModule.findAll({
      include: [
        {
          model: ProjectModel,
          attributes: ["projectid", "projectname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const updatedData = modules.map((module) => ({
      moduleid: module.moduleid,
      projectid: module.projectid,
      modulename: module.modulename,
      projectname: module.ProjectModel?.projectname || null,
      description: module.description,
      createdby: module.createdby,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: updatedData,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getProjectByModules = async (req, res, next) => {
  try {
    if (!req.body.projectid) {
      throw new ApiErrorResponse("Projectid is required", 400);
    }

    const product = await ProjectModel.findByPk(req.body.projectid);

    if (!product) {
      throw new ApiErrorResponse("Product not found", 404);
    }

    const modules = await ProjectModule.findAll({
      where: {
        projectid: req.body.projectid,
        createdby: req.user.userid,
      },
    });
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: modules ?? [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

/* Assignments Functions */

export const addAssignments = async (req, res, next) => {
  try {
    const {
      employeeid,
      projectid,
      moduleid,
      priority,
      assigneddate,
      deadlinedate,
      remarks,
    } = req.body;

    const requiredFields = [
      "employeeid",
      "projectid",
      "moduleid",
      "priority",
      "assigneddate",
      "deadlinedate",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiErrorResponse(`${field} is required`, 400);
      }
    }

    if (new Date(deadlinedate) < new Date(assigneddate)) {
      throw new ApiErrorResponse("Deadline must be after assigned date", 400);
    }

    const assignment = await AssignProjectModel.create({
      employeeid,
      projectid,
      moduleid,
      priority,
      assigneddate,
      deadlinedate,
      remarks: remarks || null,
      createdby: req.user?.userid,
    });

    if (!assignment) {
      throw new ApiErrorResponse("Failed to add assignment", 400);
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Assignment added successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateAssignments = async (req, res, next) => {
  try {
    const { assignmentid } = req.body;

    const {
      employeeid,
      projectid,
      moduleid,
      priority,
      assigneddate,
      deadlinedate,
      remarks,
    } = req.body;

    if (!assignmentid) {
      throw new ApiErrorResponse("Assignment ID is required", 400);
    }

    const requiredFields = [
      "employeeid",
      "projectid",
      "moduleid",
      "priority",
      "assigneddate",
      "deadlinedate",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiErrorResponse(`${field} is required`, 400);
      }
    }

    if (new Date(deadlinedate) < new Date(assigneddate)) {
      throw new ApiErrorResponse("Deadline must be after assigned date", 400);
    }

    const existingAssignment = await AssignProjectModel.findByPk(assignmentid);

    if (!existingAssignment) {
      throw new ApiErrorResponse("Assignment not found", 404);
    }

    const updatedAssignment = await AssignProjectModel.update(
      {
        employeeid,
        projectid,
        moduleid,
        priority,
        assigneddate,
        deadlinedate,
        remarks: remarks || null,
        createdby: req.user?.userid,
      },
      { where: { assignmentid: assignmentid } },
    );

    if (!updatedAssignment) {
      throw new ApiErrorResponse("Failed to update assignment", 400);
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Assignment updated successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getAllAssignments = async (req, res, next) => {
  try {
    const allAssignments = await AssignProjectModel.findAll({
      include: [
        {
          model: EmployeeModel,
          attributes: ["employeeid", "employeename"],
        },
        {
          model: ProjectModel,
          attributes: ["projectid", "projectname"],
        },
        {
          model: ProjectModule,
          attributes: ["moduleid", "modulename"],
        },
      ],
    });

    const flattenedAssignments = allAssignments.map((a) => {
      return {
        assignmentid: a.assignmentid,
        employeeid: a.employeeid,
        employeename: a.EmployeeModel?.employeename || null,
        projectid: a.projectid,
        projectname: a.ProjectModel?.projectname || null,
        moduleid: a.moduleid,
        modulename: a.ProjectModule?.modulename || null,
        assigneddate: a.assigneddate,
        deadlinedate: a.deadlinedate,
        remarks: a.remarks,
        priority: a.priority,
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: flattenedAssignments,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const { assignmentid } = req.body;

    if (!assignmentid) {
      throw new ApiErrorResponse("Assignmentid required");
    }

    const deleteAssignment = await AssignProjectModel.destroy({
      where: {
        assignmentid: assignmentid,
      },
    });
    if (deleteAssignment) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Assignment deleted successfully",
        }),
      );
    }
  } catch (error) {
    next(error);
  }
};

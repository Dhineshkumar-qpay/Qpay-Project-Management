import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../../admin/models/project_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import "../../middleware/associations.js";

export const employeeProjects = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid;

    if (!employeeid) {
      throw new ApiErrorResponse("Unauthorized", 401);
    }

    const projects = await AssignProjectModel.findAll({
      where: {
        employeeid: employeeid,
      },
      include: [
        {
          model: ProjectModel,
          attributes: [
            "projectid",
            "projectname",
            "description",
          ],
        },
        {
          model: ProjectModule,
          attributes: ["moduleid", "modulename", "description"],
        },
      ],
    });

    const updateddata = projects.map((p) => {
      return {
        assignmentid: p.assignmentid,
        employeeid: p.employeeid,
        assigneddate: p.assigneddate,
        deadlinedate: p.deadlinedate,
        remarks: p.remarks,
        createdby: p.createdby,
        priority: p.priority,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        project: {
          projectid: p.ProjectModel?.projectid,
          projectname: p.ProjectModel?.projectname,
          description: p.ProjectModel?.description,
        },
        module: {
          moduleid: p.ProjectModule?.moduleid,
          modulename: p.ProjectModule?.modulename,
          description: p.ProjectModule?.description,
        },
      };
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: updateddata,
      }),
    );
  } catch (error) {
    next(error);
  }
};

import { LeaveModel } from "../admin/models/leave_model.js";
import { Op } from "sequelize";

/**
 * Calculates leave balance dynamically based on monthly accrual and usage.
 * Business Rules:
 * - 24 leaves per year (12 CL, 12 SL)
 * - 1 CL & 1 SL credited per month
 * - Reset every January
 */
export const calculateLeaveSummary = async (employeeid) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    // Total eligible leaves so far this year
    const monthsPassed = currentMonth;
    const eligibleCL = monthsPassed * 1;
    const eligibleSL = monthsPassed * 1;
    const totalEligible = eligibleCL + eligibleSL;

    // Fetch all approved and pending leaves for this employee in the current year
    const takenLeaves = await LeaveModel.findAll({
        where: {
            employeeid,
            status: { [Op.in]: ["Approved", "Pending"] },
            startdate: {
                [Op.gte]: `${currentYear}-01-01`,
                [Op.lte]: `${currentYear}-12-31`,
            },
        },
    });

    let takenCL = 0;
    let takenSL = 0;

    takenLeaves.forEach((leave) => {
        const days = parseFloat(leave.totaldays || 0);
        if (leave.leavetype === "Casual Leave") {
            takenCL += days;
        } else if (leave.leavetype === "Sick Leave") {
            takenSL += days;
        }
    });

    const takenTotal = takenCL + takenSL;

    return {
        employeeId: employeeid,
        month: now.toLocaleString("default", { month: "long" }),
        eligibleLeaves: totalEligible,
        takenLeaves: takenTotal,
        balanceLeaves: totalEligible - takenTotal,
        yearlyTotal: 24,
        casualLeave: {
            eligible: eligibleCL,
            taken: takenCL,
            balance: eligibleCL - takenCL,
            yearlyTotal: 12,
        },
        sickLeave: {
            eligible: eligibleSL,
            taken: takenSL,
            balance: eligibleSL - takenSL,
            yearlyTotal: 12,
        },
    };
};

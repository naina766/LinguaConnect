import { Request, Response } from "express";
import * as adminService from "../services/adminService";
import { sendResponse } from "../utils/responseHandler";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendResponse(res, 200, "Dashboard stats fetched successfully", stats);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to fetch dashboard stats", message);
  }
};

export const addLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.body;
    const lang = await adminService.addLanguage(language);
    sendResponse(res, 200, "Language added successfully", lang);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to add language", message);
  }
};

export const uploadFAQs = async (req: Request, res: Response) => {
  try {
    const { faqs } = req.body;
    const result = await adminService.uploadFAQs(faqs);
    sendResponse(res, 200, "FAQs uploaded successfully", result);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to upload FAQs", message);
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await adminService.getReports();
    sendResponse(res, 200, "Reports fetched successfully", reports);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to fetch reports", message);
  }
};

export const getLanguageUsage = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getLanguageUsageStats();
    sendResponse(res, 200, "Language stats fetched", stats);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to fetch language stats", message);
  }
};

export const getWeeklyActivity = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getWeeklyActivityStats();
    sendResponse(res, 200, "Weekly activity fetched", stats);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to fetch weekly activity", message);
  }
};

export const exportReports = async (req: Request, res: Response) => {
  try {
    const csv = await adminService.exportReportsCSV();
    res.header("Content-Type", "text/csv");
    res.attachment("reports.csv");
    res.send(csv);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    sendResponse(res, 500, "Failed to export reports", message);
  }
};

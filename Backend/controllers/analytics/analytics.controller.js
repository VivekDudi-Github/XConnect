import { getAnalyticsDashboard } from "./analytics.service.js";
import { analyticsPageSchema } from "./analytics.schema.js";
import { ResSuccess , TryCatch } from "../../utils/extra.js";

export const getAnalyticsPage = TryCatch(async (req, res) => {
  const parsed = analyticsPageSchema.safeParse({
    userId: req.user._id.toString(),
  });

  if (!parsed.success) {
    return res.status(400).json(parsed.error.format());
  }

  const data = await getAnalyticsDashboard(parsed.data.userId);
  return ResSuccess(res, 200, data);
}, "getAnalyticsPage");

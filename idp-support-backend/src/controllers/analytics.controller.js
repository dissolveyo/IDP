import { AnalyticType } from "../enums/AnalyticType.js";
import Analytics from "../models/analytics.model.js";
import Application from "../models/application.model.js";
import Listing from "../models/listing.model.js";
import { getRegionFromCoordinates } from "../utils/index.js";
import Complaint from "../models/complaint.model.js";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

dayjs.extend(isSameOrBefore);

export async function generateLengthOfStayAnalytics(from, to) {
  const approvedApplications = await Application.find({
    status: "approved",
    createdAt: { $gte: from, $lte: to },
  }).lean();

  const listingIds = approvedApplications.map((app) =>
    app.listingId.toString()
  );
  const listings = await Listing.find({ _id: { $in: listingIds } }).lean();

  const listingMap = new Map(
    listings.map((listing) => [listing._id.toString(), listing])
  );

  const termCounts = {};

  approvedApplications.forEach((app) => {
    const listing = listingMap.get(app.listingId.toString());
    const term = listing?.options?.term;
    if (term) {
      termCounts[term] = (termCounts[term] || 0) + 1;
    }
  });

  const analytics = new Analytics({
    data: termCounts,
    type: AnalyticType.LENGTH_OF_STAY,
  });

  await analytics.save();
  return analytics;
}

export async function generateApplicationsPerDayAnalytics(from, to) {
  const applications = await Application.find({
    createdAt: { $gte: from, $lte: to },
  })
    .select("createdAt")
    .lean();

  const dataByDate = {};

  applications.forEach((app) => {
    const date = dayjs(app.createdAt).startOf("day").format("YYYY-MM-DD");
    dataByDate[date] = (dataByDate[date] || 0) + 1;
  });

  const result = {
    data: dataByDate,
    total: applications.length,
  };

  const analytics = new Analytics({
    data: result,
    type: AnalyticType.HOUSE_DEMAND,
  });

  await analytics.save();
  return analytics;
}

export async function generateRelocationRegionAnalytics(from, to) {
  const applications = await Application.find({
    status: "approved",
    createdAt: { $gte: from, $lte: to },
  })
    .select("listingId createdAt")
    .lean();

  const listingIds = applications.map((app) => app.listingId.toString());

  const listings = await Listing.find({
    _id: { $in: listingIds },
  })
    .select("location")
    .lean();

  const listingLocationMap = {};
  listings.forEach((listing) => {
    listingLocationMap[listing._id.toString()] = listing.location;
  });

  const regionCache = {};
  const regionCounts = {};

  for (const app of applications) {
    const id = app.listingId.toString();
    if (!listingLocationMap[id]) continue;

    if (!regionCache[id]) {
      const { lat, lng } = listingLocationMap[id];
      const region = await getRegionFromCoordinates(lat, lng);
      regionCache[id] = region || "Unknown region";
    }

    const regionName = regionCache[id];
    regionCounts[regionName] = (regionCounts[regionName] || 0) + 1;
  }

  const sortedRegions = Object.entries(regionCounts)
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const analytics = new Analytics({
    data: sortedRegions,
    type: AnalyticType.RELOCATION_REGIONS,
  });

  await analytics.save();

  return sortedRegions;
}

export const generateFraudComplaintsAnalytics = async (from, to) => {
  const result = await Complaint.aggregate([
    {
      $match: {
        $or: [
          {
            type: "listing",
            reason: {
              $in: [
                "duplicate_listing",
                "fraudulent_listing",
                "incorrect_location",
              ],
            },
          },
          {
            type: "chat",
            reason: { $in: ["scam_attempt", "unwanted_contact"] },
          },
          {
            type: "comment",
            reason: { $in: ["false_information"] },
          },
        ],
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          type: "$type",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const formatted = {};

  for (
    let date = dayjs(from).clone();
    date.isSameOrBefore(dayjs(to), "day");
    date = date.add(1, "day")
  ) {
    formatted[date.format("YYYY-MM-DD")] = {
      listing: 0,
      chat: 0,
      comment: 0,
    };
  }

  for (const entry of result) {
    const { date, type } = entry._id;
    const count = entry.count;

    if (formatted[date] && ["listing", "chat", "comment"].includes(type)) {
      formatted[date][type] += count;
    }
  }

  await Analytics.create({
    data: formatted,
    type: AnalyticType.FRAUD_FREQUENCY,
    generatedAt: new Date(),
  });

  return formatted;
};

export async function generateInfrastructureLoadAnalytics() {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  const applications = await Application.find({
    status: "approved",
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  }).lean();

  if (!applications.length) return;

  const listingApplicationCountMap = new Map();

  for (const app of applications) {
    const key = app.listingId.toString();
    listingApplicationCountMap.set(
      key,
      (listingApplicationCountMap.get(key) || 0) + 1
    );
  }

  const listingIds = [...listingApplicationCountMap.keys()];

  const listings = await Listing.find({ _id: { $in: listingIds } }).lean();

  const regionLoadMap = new Map();

  const regionCache = new Map();

  for (const listing of listings) {
    const count = listingApplicationCountMap.get(listing._id.toString()) || 0;
    const peoplePerApplication = listing.options?.people || 1;
    const totalPeople = count * peoplePerApplication;

    const { lat, lng } = listing.location;
    const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    let region = regionCache.get(coordKey);
    if (!region) {
      region = await getRegionFromCoordinates(lat, lng);
      if (region) regionCache.set(coordKey, region);
    }

    if (!region) continue;

    regionLoadMap.set(region, (regionLoadMap.get(region) || 0) + totalPeople);
  }

  const result = [...regionLoadMap.entries()].map(
    ([region, amountOfPeople]) => ({
      region,
      amountOfPeople,
    })
  );

  await Analytics.create({
    data: result,
    type: AnalyticType.INFRASTRUCTURE_LOAD,
    generatedAt: new Date(),
  });

  return result;
}

export async function getLengthOfStayAnalytics() {
  const analytics = await Analytics.findOne({
    type: AnalyticType.LENGTH_OF_STAY,
  }).sort({ generatedAt: 1 });

  return analytics;
}

export async function getApplicationPerDayAnalytics() {
  const analytics = await Analytics.findOne({
    type: AnalyticType.HOUSE_DEMAND,
  }).sort({ generatedAt: 1 });

  return analytics;
}

export async function getRelocationRegionsAnalytics() {
  const analytics = await Analytics.findOne({
    type: AnalyticType.RELOCATION_REGIONS,
  }).sort({ generatedAt: 1 });

  return analytics;
}

export async function getFraudComplaintsAnalytics() {
  const analytics = await Analytics.findOne({
    type: AnalyticType.FRAUD_FREQUENCY,
  }).sort({ generatedAt: 1 });

  return analytics;
}

export async function getInfrastructureLoadAnalytics() {
  const analytics = await Analytics.findOne({
    type: AnalyticType.INFRASTRUCTURE_LOAD,
  }).sort({ generatedAt: 1 });

  return analytics;
}

export const getAnalyticsByType = async (req, res) => {
  const { type } = req.params;

  try {
    let analytics;

    switch (type) {
      case AnalyticType.LENGTH_OF_STAY:
        analytics = await getLengthOfStayAnalytics();
        break;

      case AnalyticType.HOUSE_DEMAND:
        analytics = await getApplicationPerDayAnalytics();
        break;

      case AnalyticType.RELOCATION_REGIONS:
        analytics = await getRelocationRegionsAnalytics();
        break;
      case AnalyticType.FRAUD_FREQUENCY:
        analytics = await getFraudComplaintsAnalytics();
        break;
      case AnalyticType.INFRASTRUCTURE_LOAD:
        analytics = await getInfrastructureLoadAnalytics();
        break;

      default:
        return res
          .status(400)
          .json({ error: `Unsupported analytics type: ${type}` });
    }

    if (!analytics) {
      return res
        .status(404)
        .json({ error: `No analytics data found for type: ${type}` });
    }

    return res.json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

import { BetaAnalyticsDataClient, protos } from "@google-analytics/data";

type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

const propertyId = process.env.GA_PROPERTY_ID;

function getClient() {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey || !propertyId) {
    throw new Error(
      "Missing GA_CLIENT_EMAIL, GA_PRIVATE_KEY, or GA_PROPERTY_ID environment variables",
    );
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

type Row = { label: string; visitors: number; pageviews: number };

function rowsFromReport(report: RunReportResponse): Row[] {
  const rows = report.rows ?? [];
  return rows.map((r) => ({
    label: r.dimensionValues?.[0]?.value ?? "",
    visitors: Number(r.metricValues?.[0]?.value ?? 0),
    pageviews: Number(r.metricValues?.[1]?.value ?? 0),
  }));
}

export type SiteAnalyticsResult = {
  totals: { visitors: number; pageviews: number } | null;
  countries: { country: string; visitors: number; pageviews: number }[];
  pages: { route: string; visitors: number; pageviews: number }[];
  referrers: {
    referrerHostname: string;
    visitors: number;
    pageviews: number;
  }[];
  devices: { deviceType: string; visitors: number; pageviews: number }[];
  browsers: { browserName: string; visitors: number; pageviews: number }[];
  events: { eventName: string; count: number }[];
};

export async function getSiteAnalytics(days = 7): Promise<SiteAnalyticsResult> {
  const client = getClient();
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];
  const metrics = [{ name: "activeUsers" }, { name: "screenPageViews" }];

  const [
    totalsResult,
    pagesResult,
    countriesResult,
    referrersResult,
    devicesResult,
    browsersResult,
    eventsResult,
  ]: RunReportResponse[] = await Promise.all([
    client.runReport({ property, dateRanges, metrics }).then((r) => r[0]),
    client
      .runReport({
        property,
        dateRanges,
        metrics,
        dimensions: [{ name: "pagePath" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      })
      .then((r) => r[0]),
    client
      .runReport({
        property,
        dateRanges,
        metrics,
        dimensions: [{ name: "country" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      })
      .then((r) => r[0]),
    client
      .runReport({
        property,
        dateRanges,
        metrics,
        dimensions: [{ name: "sessionSource" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      })
      .then((r) => r[0]),
    client
      .runReport({
        property,
        dateRanges,
        metrics,
        dimensions: [{ name: "deviceCategory" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      })
      .then((r) => r[0]),
    client
      .runReport({
        property,
        dateRanges,
        metrics,
        dimensions: [{ name: "browser" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      })
      .then((r) => r[0]),
    // ── Custom events (e.g. request_viewing_submit, inquiry_submit, etc.) ──
    client
      .runReport({
        property,
        dateRanges,
        metrics: [{ name: "eventCount" }],
        dimensions: [{ name: "eventName" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 15,
      })
      .then((r) => r[0]),
  ]);

  const totalsRow = totalsResult.rows?.[0];

  return {
    totals: {
      visitors: Number(totalsRow?.metricValues?.[0]?.value ?? 0),
      pageviews: Number(totalsRow?.metricValues?.[1]?.value ?? 0),
    },
    pages: rowsFromReport(pagesResult).map((r) => ({
      route: r.label,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    countries: rowsFromReport(countriesResult).map((r) => ({
      country: r.label,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    referrers: rowsFromReport(referrersResult).map((r) => ({
      referrerHostname: r.label,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    devices: rowsFromReport(devicesResult).map((r) => ({
      deviceType: r.label,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    browsers: rowsFromReport(browsersResult).map((r) => ({
      browserName: r.label,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    events: (eventsResult.rows ?? []).map((r) => ({
      eventName: r.dimensionValues?.[0]?.value ?? "",
      count: Number(r.metricValues?.[0]?.value ?? 0),
    })),
  };
}

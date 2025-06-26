export interface Page {
  path: string;
  views: number;
}

export interface UserFlow {
  from: string;
  to: string;
  count: number;
}

export interface DataPoint {
  timestamp: string;
  siteId: string;
  siteName: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Page[];
  performanceMetrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  userFlow: UserFlow[];
}
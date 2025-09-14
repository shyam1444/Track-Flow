import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    }
  }
}

export interface AnalyticsData {
  leads: {
    total: number;
    byStage: Record<string, number>;
    conversionRate: number;
    avgTimeInStage: Record<string, number>;
    monthlyGrowth: Array<{ month: string; count: number }>;
    topCompanies: Array<{ company: string; count: number }>;
    leadSources: Array<{ source: string; count: number }>;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    completionRate: number;
    avgProcessingTime: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    topProducts: Array<{ product: string; count: number }>;
  };
  costs: {
    totalCosts: number;
    costBreakdown: {
      development: number;
      marketing: number;
      operations: number;
      overhead: number;
    };
    costPerLead: number;
    costPerOrder: number;
    roi: number;
    monthlyCosts: Array<{ month: string; cost: number }>;
    costTrends: Array<{ period: string; cost: number; trend: 'up' | 'down' | 'stable' }>;
  };
  performance: {
    teamProductivity: Array<{ member: string; leadsHandled: number; ordersCompleted: number; efficiency: number }>;
    responseTime: {
      avgFirstResponse: number;
      avgFollowUp: number;
      slaCompliance: number;
    };
    qualityMetrics: {
      customerSatisfaction: number;
      orderAccuracy: number;
      deliveryOnTime: number;
    };
  };
  predictions: {
    nextMonthLeads: number;
    nextMonthOrders: number;
    nextMonthRevenue: number;
    churnRisk: Array<{ leadId: string; risk: 'high' | 'medium' | 'low'; reason: string }>;
  };
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  stages: string[];
  statuses: string[];
  companies: string[];
  products: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
} 
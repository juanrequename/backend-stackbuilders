import mongoose, { Schema } from 'mongoose';
import { CrawlerFilterType } from '../types/crawler';

export type UsageLogAttributes = {
  requestedAt: Date;
  filterType: CrawlerFilterType;
  requestId?: string;
  entryCount?: number;
  resultCount?: number;
  durationMs?: number;
  sourceUrl?: string;
  status?: 'success' | 'error';
};

const usageLogSchema = new Schema<UsageLogAttributes>(
  {
    requestedAt: { type: Date, required: true },
    filterType: { type: String, required: true },
    requestId: { type: String },
    entryCount: { type: Number },
    resultCount: { type: Number },
    durationMs: { type: Number },
    sourceUrl: { type: String },
    status: { type: String },
  },
  { collection: 'usage_logs' }
);

export const UsageLogModel =
  mongoose.models.UsageLog || mongoose.model<UsageLogAttributes>('UsageLog', usageLogSchema);

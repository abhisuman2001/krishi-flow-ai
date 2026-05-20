import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, User, Phone, Calendar,
  Brain, Building, Lightbulb, Clock,
  CheckCircle, AlertTriangle, FileText,
} from 'lucide-react';
import { cn, getStatusClass, getSeverityClass, formatDateTime, getCategoryIcon } from '@/lib/utils';
import TicketActions from './TicketActions';
import { Ticket } from '@/lib/types';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';
import mongoose from 'mongoose';

type PageProps = { params: Promise<{ id: string }> };

async function getTicket(id: string): Promise<Ticket | null> {
  try {
    await connectDB();

    // Support both MongoDB ObjectId and ticketId string (e.g. KF-2026-1234)
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const raw = isObjectId
      ? await TicketModel.findById(id).lean()
      : await TicketModel.findOne({ ticketId: id }).lean();

    if (!raw) return null;

    return {
      ...(raw as unknown as Ticket),
      _id: String(raw._id),
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
      updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
    };
  } catch {
    return null;
  }
}

export default async function TicketDetailPage(props: PageProps) {
  const { id } = await props.params;
  const ticket = await getTicket(id);

  if (!ticket) notFound();

  const timeline = [
    {
      icon: FileText,
      title: 'Ticket Created',
      desc: `Submitted by ${ticket.farmerName}`,
      time: ticket.createdAt,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      icon: Brain,
      title: 'AI Classification Complete',
      desc: `Classified as ${ticket.category} — ${ticket.severity} severity`,
      time: ticket.createdAt,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
    ...(ticket.assignedOfficer ? [{
      icon: User,
      title: 'Officer Assigned',
      desc: `Assigned to ${ticket.assignedOfficer}`,
      time: ticket.updatedAt,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    }] : []),
    ...(ticket.status === 'Escalated' ? [{
      icon: AlertTriangle,
      title: 'Ticket Escalated',
      desc: 'Escalated to senior officer for urgent attention',
      time: ticket.updatedAt,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
    }] : []),
    ...(ticket.status === 'Resolved' ? [{
      icon: CheckCircle,
      title: 'Issue Resolved',
      desc: 'Ticket marked as resolved',
      time: ticket.updatedAt,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/tickets" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
              <span className="font-mono text-green-400 text-sm">{ticket.ticketId}</span>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusClass(ticket.status))}>
                {ticket.status}
              </span>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getSeverityClass(ticket.severity))}>
                {ticket.severity}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{ticket.category} Issue</h1>
            <p className="text-slate-400 text-sm mt-1">Submitted {formatDateTime(ticket.createdAt)}</p>
          </div>
          <TicketActions ticket={ticket} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Issue */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Issue Description
              </h2>
              <p className="text-slate-300 leading-relaxed">{ticket.issue}</p>
            </div>

            {/* AI Analysis */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> AI Analysis
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Category', value: ticket.category },
                  { label: 'Crop', value: ticket.crop },
                  { label: 'Department', value: ticket.department || 'Not assigned' },
                  {
                    label: 'Severity',
                    value: (
                      <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full', getSeverityClass(ticket.severity))}>
                        {ticket.severity}
                      </span>
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className="font-semibold text-white text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {ticket.suggestedAction && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Suggested Action</span>
                  </div>
                  <p className="text-sm text-slate-300">{ticket.suggestedAction}</p>
                </div>
              )}

              {ticket.aiSummary && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-500 mb-2">AI Summary</p>
                  <p className="text-sm text-slate-300 italic">&ldquo;{ticket.aiSummary}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Activity Timeline
              </h2>
              <div className="space-y-4">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', item.bg)}>
                          <Icon className={cn('w-4 h-4', item.color)} />
                        </div>
                        {index < timeline.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-white text-sm">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDateTime(item.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Farmer Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {ticket.farmerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{ticket.farmerName}</p>
                    <p className="text-xs text-slate-500">Farmer</p>
                  </div>
                </div>
                {ticket.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />{ticket.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4" />{ticket.district}, {ticket.state}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />{formatDateTime(ticket.createdAt)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" /> Assignment
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned Officer</p>
                  <p className="text-sm font-medium text-white">{ticket.assignedOfficer || 'Not yet assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Department</p>
                  <p className="text-sm font-medium text-white">{ticket.department || 'Pending classification'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Language</p>
                  <p className="text-sm font-medium text-white">{ticket.language}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

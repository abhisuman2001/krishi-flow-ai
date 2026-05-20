'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle,
  Brain,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  Leaf,
  FileText,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIClassification } from '@/lib/types';
import { SUPPORTED_LANGUAGES, INDIAN_STATES, MAHARASHTRA_DISTRICTS } from '@/lib/mock-data';
import { getSeverityClass, getCategoryIcon } from '@/lib/utils';

// District lists per state — expand as needed; falls back to Maharashtra list
const DISTRICTS_BY_STATE: Record<string, string[]> = {
  Maharashtra: MAHARASHTRA_DISTRICTS,
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
  Karnataka: ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  Gujarat: ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  Punjab: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran'],
};

type Step = 'form' | 'classifying' | 'review' | 'success';

interface FormData {
  farmerName: string;
  phone: string;
  district: string;
  state: string;
  language: string;
  crop: string;
  issue: string;
}

export default function SubmitForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<FormData>({
    farmerName: '',
    phone: '',
    district: '',
    state: 'Maharashtra',
    language: 'hi',
    crop: '',
    issue: '',
  });
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset district when state changes so stale value isn't submitted
      ...(field === 'state' ? { district: '' } : {}),
    }));
  };

  const handleClassify = async () => {
    if (!formData.farmerName || !formData.district || !formData.crop || !formData.issue) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setStep('classifying');

    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue: formData.issue,
          crop: formData.crop,
          language: formData.language,
        }),
      });

      const data = await res.json();
      setClassification(data.classification);
      setIsMock(data.mock || false);
      setStep('review');
    } catch {
      setError('Failed to classify issue. Please try again.');
      setStep('form');
    }
  };

  const handleSubmit = async () => {
    if (!classification) return;
    setStep('classifying');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          severity: classification.severity,
          category: classification.category,
          department: classification.department,
          suggestedAction: classification.suggestedAction,
        }),
      });

      const data = await res.json();
      setTicketId(data.ticket.ticketId);
      setStep('success');
    } catch {
      setError('Failed to submit ticket. Please try again.');
      setStep('review');
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-12 px-6 rounded-2xl border border-green-500/20 bg-green-500/5">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ticket Submitted!</h2>
        <p className="text-slate-400 mb-4">Your issue has been registered and will be reviewed by an agriculture officer.</p>
        <div className="inline-block px-6 py-3 rounded-xl bg-slate-800 border border-white/10 mb-6">
          <p className="text-xs text-slate-500 mb-1">Your Ticket ID</p>
          <p className="text-2xl font-bold text-green-400 font-mono">{ticketId}</p>
        </div>
        <p className="text-sm text-slate-500 mb-8">Save this ID to track your ticket status</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/tickets')} variant="gradient">
            View All Tickets
          </Button>
          <Button onClick={() => { setStep('form'); setFormData({ farmerName: '', phone: '', district: '', state: 'Maharashtra', language: 'hi', crop: '', issue: '' }); setClassification(null); }} variant="outline">
            Submit Another Issue
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'classifying') {
    return (
      <div className="text-center py-16 px-6 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">AI is analyzing your issue...</h2>
        <p className="text-slate-400 mb-6">Groq AI is classifying your problem and finding the right solution</p>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
          <span className="text-sm text-slate-400">Processing with Llama 3.3 70B...</span>
        </div>
      </div>
    );
  }

  if (step === 'review' && classification) {
    return (
      <div className="space-y-6">
        {/* AI Classification Result */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">AI Classification Result</h3>
            {isMock && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Demo Mode
              </span>
            )}
            <span className="ml-auto text-xs text-slate-500">
              Confidence: {Math.round((classification.confidence || 0.82) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <p className="font-semibold text-white flex items-center gap-1">
                <span>{getCategoryIcon(classification.category)}</span>
                {classification.category}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Severity</p>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getSeverityClass(classification.severity)}`}>
                {classification.severity}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Crop</p>
              <p className="font-semibold text-white">{classification.crop}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Department</p>
              <p className="font-semibold text-white text-sm">{classification.department}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-400 mb-1 font-medium">💡 Suggested Action</p>
            <p className="text-sm text-slate-300">{classification.suggestedAction}</p>
          </div>

          {classification.summary && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1 font-medium">📋 AI Summary</p>
              <p className="text-sm text-slate-300 italic">&ldquo;{classification.summary}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Farmer Details Summary */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-white mb-4">Submission Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Farmer:</span> <span className="text-white ml-1">{formData.farmerName}</span></div>
            <div><span className="text-slate-500">District:</span> <span className="text-white ml-1">{formData.district}</span></div>
            <div><span className="text-slate-500">Crop:</span> <span className="text-white ml-1">{formData.crop}</span></div>
            <div><span className="text-slate-500">State:</span> <span className="text-white ml-1">{formData.state}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-1">Issue Description</p>
            <p className="text-sm text-slate-300">{formData.issue}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
            Edit Details
          </Button>
          <Button variant="gradient" onClick={handleSubmit} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            Confirm & Submit Ticket
          </Button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-6">
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Ramesh Kumar"
              value={formData.farmerName}
              onChange={(e) => handleChange('farmerName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              State <span className="text-red-400">*</span>
            </label>
            <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              District <span className="text-red-400">*</span>
            </label>
            <Select value={formData.district} onValueChange={(v) => handleChange('district', v)}>
              <SelectTrigger>
                <SelectValue placeholder={formData.state ? 'Select district' : 'Select state first'} />
              </SelectTrigger>
              <SelectContent>
                {(DISTRICTS_BY_STATE[formData.state] ?? MAHARASHTRA_DISTRICTS).map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Language & Crop */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Language & Crop
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Preferred Language</label>
            <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Crop Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="e.g. Tomato, Cotton, Wheat"
                value={formData.crop}
                onChange={(e) => handleChange('crop', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Issue Description */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Issue Description
        </h3>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Describe your problem in detail <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Describe the problem you are facing with your crop. Include symptoms, when it started, how much area is affected, etc."
            value={formData.issue}
            onChange={(e) => handleChange('issue', e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-slate-600 mt-1">{formData.issue.length}/500 characters</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        variant="gradient"
        size="lg"
        className="w-full gap-2"
        onClick={handleClassify}
      >
        <Brain className="w-5 h-5" />
        Analyze with AI & Continue
      </Button>

      <p className="text-xs text-center text-slate-600">
        Your issue will be analyzed by Groq AI and assigned to the appropriate agriculture officer.
      </p>
    </div>
  );
}

import type { Persona } from '@/types/persona'

export const MOCK_PERSONAS: Persona[] = [
  {
    id: 'p-ava-01',
    name: 'Ava Patel',
    summary:
      'Young professional focused on building an emergency fund and optimizing day-to-day cashflow. Prefers concise insights and gentle nudges.',
    status: 'active',
    riskAffinity: 'moderate',
    tonePreference: 'friendly',
    contactChannels: ['app push', 'email'],
    goals: ['build emergency fund', 'optimize subscriptions', 'credit score improvement'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-li-02',
    name: 'Li Wei',
    summary:
      'MSME owner seeking cashflow smoothing and tax-efficient savings. Time-poor; values actionable summaries and WhatsApp follow-ups.',
    status: 'active',
    riskAffinity: 'conservative',
    tonePreference: 'professional',
    contactChannels: ['whatsapp', 'email'],
    goals: ['cashflow buffer', 'tax planning', 'supplier payment optimization'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-carlos-03',
    name: 'Carlos Rodriguez',
    summary:
      'Planning for a growing family. Interested in baby fund, insurance coverage gaps, and loan restructuring opportunities.',
    status: 'learning',
    riskAffinity: 'moderate',
    tonePreference: 'empathetic',
    contactChannels: ['app push', 'sms'],
    goals: ['baby fund', 'insurance coverage review', 'home loan restructuring'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-sara-04',
    name: 'Sara Kim',
    summary:
      'High-engagement user with subscription fatigue. Prefers proactive recommendations and channel switching during high workload.',
    status: 'active',
    riskAffinity: 'balanced',
    tonePreference: 'concise',
    contactChannels: ['app push'],
    goals: ['reduce subscription fatigue', 'optimize bill cycles'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-ade-05',
    name: 'Adebola A.',
    summary:
      'Entrepreneur with seasonal revenue. Seeks micro-loan timing guidance and savings allocation across multiple goals.',
    status: 'active',
    riskAffinity: 'growth',
    tonePreference: 'motivational',
    contactChannels: ['email', 'app push'],
    goals: ['seasonal buffer', 'goal-based savings', 'micro-loan optimization'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-nora-06',
    name: 'Nora Jensen',
    summary:
      'Debt-averse user; appreciates empathetic tone and alternatives to credit. Responds well to visual progress nudges.',
    status: 'active',
    riskAffinity: 'conservative',
    tonePreference: 'empathetic',
    contactChannels: ['email'],
    goals: ['zero-interest alternatives', 'visual progress tracking'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

import { dispatch, type ToolName } from '@ess/gemini/src';

export type NormalizedMessage = {
  from: string;
  text?: string;
  mediaUrl?: string;
  mediaContentType?: string;
  timestamp: string;
};

export type OrchestratorResult = {
  actionsExecuted: ToolName[];
  offloaded: boolean;
};

export async function runOrchestration(
  msg: NormalizedMessage,
  opts: { deadlineMs: number; now?: () => number },
): Promise<OrchestratorResult> {
  const start = opts.now?.() ?? Date.now();
  const budget = () => (opts.now?.() ?? Date.now()) - start;

  const actions: ToolName[] = [];

  // Skeleton logic: just logInteraction and return; if beyond 6s budget, pretend to offload
  if (budget() > opts.deadlineMs - 500) {
    return { actionsExecuted: actions, offloaded: true };
  }

  await dispatch(
    'logInteraction',
    {
      leadId: 'stub',
      channel: 'whatsapp',
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      outcome: 'message_sent',
    },
    { actor: 'system' },
  );
  actions.push('logInteraction');
  return { actionsExecuted: actions, offloaded: false };
}



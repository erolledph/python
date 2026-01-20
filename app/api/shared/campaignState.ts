// Shared campaign state to avoid duplication between API routes
let campaignState = {
  isRunning: false,
  total: 0,
  sent: 0,
  failed: 0,
  currentEmail: '',
  errors: [] as string[]
};

export const updateCampaignState = (newState: Partial<typeof campaignState>) => {
  campaignState = { ...campaignState, ...newState };
};

export const getCampaignState = () => campaignState;

export default campaignState;

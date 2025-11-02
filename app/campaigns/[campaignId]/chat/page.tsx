import CampaignChat from '@/components/CampaignChat';

interface PageProps {
  params: {
    campaignId: string;
  };
}

export function generateStaticParams() {
  return [];
}

export default function CampaignChatPage({ params }: PageProps) {
  return <CampaignChat campaignId={params.campaignId} />;
}

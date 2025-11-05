import CampaignWorkspace from '@/components/workspace/CampaignWorkspace';

interface PageProps {
  params: {
    campaignId: string;
  };
}

export function generateStaticParams() {
  return [];
}

export default function WorkspacePage({ params }: PageProps) {
  return <CampaignWorkspace campaignId={params.campaignId} />;
}

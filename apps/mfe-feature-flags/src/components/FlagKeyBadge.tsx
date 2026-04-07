import { Badge } from '@dxp/ui';

interface FlagKeyBadgeProps {
  flagKey: string;
}

export function FlagKeyBadge({ flagKey }: FlagKeyBadgeProps) {
  return (
    <Badge variant="default" className="font-mono text-xs">
      {flagKey}
    </Badge>
  );
}

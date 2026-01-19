import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

export default function AssetClassSelect({
  assetClasses,
  currentAssetClass,
  setAssetClass,
}: {
  assetClasses: string[];
  currentAssetClass: string;
  setAssetClass: (value: string) => void;
}) {
  return (
    <Select value={currentAssetClass} onValueChange={setAssetClass}>
      <SelectTrigger
        className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
        aria-label="Select an asset class"
      >
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {assetClasses.map((assetClass) => (
          <SelectItem
            key={assetClass}
            value={assetClass}
            className="rounded-lg"
          >
            {assetClass}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

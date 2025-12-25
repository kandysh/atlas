import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function AssetClassSelect({
  assestClasses,
  currentAssetClass,
  setAssestClass,
}: {
  assestClasses: string[];
  currentAssetClass: string;
  setAssestClass: (value: string) => void;
}) {
  return (
    <Select value={currentAssetClass} onValueChange={setAssestClass}>
      <SelectTrigger
        className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
        aria-label="Select an asset class"
      >
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {assestClasses.map((assetClass) => (
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

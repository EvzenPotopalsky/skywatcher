export interface HeaderProps {
  locName: string;
  onLocationChange: (regionName: string) => void;
  regions: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Icon set: Phosphor's context-free "ssr" build works in both Server and Client Components.
 * Brand glyphs Phosphor lacks (Tripadvisor) are drawn here.
 */
import type { SVGProps } from "react";
import type { SocialPlatform } from "@/lib/types";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  WhatsappLogoIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/ssr";

export {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ArrowUpRightIcon,
  ArrowsClockwiseIcon,
  BabyIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CarIcon,
  ChargingStationIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CoffeeIcon,
  ConfettiIcon,
  CopyIcon,
  DotsSixVerticalIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  FileTextIcon,
  FloppyDiskIcon,
  ForkKnifeIcon,
  GameControllerIcon,
  GearIcon,
  GiftIcon,
  HouseIcon,
  ImageIcon,
  ImagesIcon,
  InfoIcon,
  LightningIcon,
  LinkIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MegaphoneSimpleIcon,
  PhoneIcon,
  PlanetIcon,
  PlayIcon,
  PlusIcon,
  QuestionIcon,
  RocketIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SneakerIcon,
  SparkleIcon,
  SpinnerGapIcon,
  StarIcon,
  TargetIcon,
  TicketIcon,
  TrashIcon,
  TrayIcon,
  UploadSimpleIcon,
  UsersIcon,
  VideoCameraIcon,
  VirtualRealityIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";

export function TripadvisorIcon({ size = 20, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="7" cy="13.5" r="3.6" />
      <circle cx="17" cy="13.5" r="3.6" />
      <circle cx="7" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
      <path d="M3 9.2c2.6-2 5.6-3 9-3s6.4 1 9 3M10.6 13.5 12 15.6l1.4-2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SocialIcon({ platform, size = 20 }: { platform: SocialPlatform; size?: number }) {
  switch (platform) {
    case "instagram":
      return <InstagramLogoIcon size={size} aria-hidden />;
    case "facebook":
      return <FacebookLogoIcon size={size} aria-hidden />;
    case "tiktok":
      return <TiktokLogoIcon size={size} aria-hidden />;
    case "youtube":
      return <YoutubeLogoIcon size={size} aria-hidden />;
    case "x":
      return <XLogoIcon size={size} aria-hidden />;
    case "whatsapp":
      return <WhatsappLogoIcon size={size} aria-hidden />;
    case "tripadvisor":
      return <TripadvisorIcon size={size} />;
  }
}

export const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  tripadvisor: "Tripadvisor",
  x: "X",
  whatsapp: "WhatsApp",
};

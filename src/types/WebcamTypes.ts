import type { LivenessCheckResult } from './TaniAuthTypes';
type RNFile = {
  uri: string;
  type: string;
  name: string;
};

export type WebCamProps = {
  setImageFile: (value: RNFile | null) => void;
  imageSrc: string | null;
  setImageSrc: (value: string | null) => void;
  cameraOpen: boolean;
  setCameraOpen: (value: boolean) => void;
};

export type VidWebCamProps = {
  error?: string | null;
  setMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
  setOpenDialog: (value: boolean) => void;
  setResult: (value: LivenessDetection | null) => void;
  onSuccess: (apiResponse: LivenessCheckResult) => void;
};

export type LivenessDetection = {
  blink_detected: boolean;
  mouth_open_detected: boolean;
  head_movement_detected: boolean;
  is_live: boolean;
};

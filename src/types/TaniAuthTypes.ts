import { TaniAuth } from '../components/controllers/TaniAuth';

type EnrollUserUserResult = {
  message: string;
  person_details: {
    person_id: string;
    client_id: string | null;
    group_id: string;
    person_name: string;
    person_email: string | null;
  };
  image_details: {
    name: string;
    image_url: string;
    person_id: string;
  };
};

type FaceRecognitionResult = {
  message: string;
  similarity_score: number;
  potential_match: string;
};

type FaceComparisonResult = {
  message: string;
  similarity_score: number;
};

export type LivenessCheckResult = {
  blink_detected: boolean;
  mouth_open_detected: boolean;
  head_movement_detected: boolean;
  is_live: boolean;
};
export type TaniAuthTypes = {
  authInstance: TaniAuth;
  onSuccess: (
    apiResponse: EnrollUserUserResult | FaceRecognitionResult
  ) => void;
};

export type FaceCompareProps = {
  authInstance: TaniAuth;
  onSuccess: (apiResponse: FaceComparisonResult) => void;
  imageUrl: string;
};

export type LivenessCheckProps = {
  onSuccess: (apiResponse: LivenessCheckResult) => void;
};

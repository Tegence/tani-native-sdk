import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import WebCamComponent from './utils/Webcam';
import { CameraView } from 'expo-camera';
import axios from './api/useAxios';
import { AxiosError } from 'axios';
import type { FacesSimilarity } from '../types/FaceSimiliarity';
import type { FaceCompareProps } from '../types/TaniAuthTypes';

const { width } = Dimensions.get('window'); // Get screen width

type RNFile = {
  uri: string;
  type: string;
  name: string;
};

const CompareFaces: React.FC<FaceCompareProps> = ({
  authInstance,
  onSuccess,
  imageUrl,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<RNFile | null>(null);
  const [referenceFile, setReferenceFile] = useState<RNFile | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [facesSimilarity, setFacesSimilarity] =
    useState<FacesSimilarity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyFace = async () => {
    setIsLoading(true);
    setOpenDialog(true);
    try {
      if (imageFile && referenceFile) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('image1', referenceFile);
        formData.append('image2', imageFile);

        const response = await axios.post('/persons/compare', formData, {
          headers: authInstance.getHeaders(),
        });
        setIsLoading(false);
        setFacesSimilarity(response.data);
        onSuccess(response.data);
        setOpenDialog(true);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      if (AxiosError) {
        if (axiosError.status === 400) {
          setError(
            'No Faces Detected in one or both images. Kindly take a clearer picture and try again'
          );
        }
        if (axiosError.status === 401) {
          setError('API key/Group Id is missing');
        }
        if (axiosError.status === 500) {
          setError('Internal server error');
        }
      }
      // console.log(err);
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setImageSrc(null);
    setImageFile(null);
    setCameraOpen(false);
    setOpenDialog(false);
    setFacesSimilarity(null);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchReferenceImage = () => {
      const file = {
        uri: imageUrl,
        type: 'image/jpeg',
        name: `reference_photo_${Date.now()}.jpg`,
      };
      setReferenceFile(file);
    };
    fetchReferenceImage();
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      {!cameraOpen && (
        <View style={styles.wrapper}>
          <Text style={styles.headingText}>Compare Faces</Text>
        </View>
      )}
      <WebCamComponent
        imageSrc={imageSrc}
        setImageSrc={setImageSrc}
        setImageFile={setImageFile}
        cameraOpen={cameraOpen}
        setCameraOpen={setCameraOpen}
        ref={cameraRef}
      />
      {imageSrc && (
        <TouchableOpacity style={styles.uploadButton} onPress={verifyFace}>
          <Text style={styles.uploadText}>Verify Image</Text>
        </TouchableOpacity>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={openDialog}
        onRequestClose={() => setOpenDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isLoading && (
              <View>
                <ActivityIndicator
                  size="large"
                  color="#007AFF"
                  style={styles.loader}
                />
                <Text style={styles.loaderText}>Comparing Images</Text>
              </View>
            )}

            {facesSimilarity && (
              <View style={styles.successContainer}>
                <View>
                  <Text style={styles.successText}>Confidence Percentage</Text>
                  <Text style={styles.resultText}>
                    <Text style={styles.bold}>
                      {' '}
                      {(facesSimilarity.similarity_score * 100).toFixed(2)}
                      %{' '}
                    </Text>
                    <Text>{facesSimilarity.message}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCloseDialog}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            {error && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{error}</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCloseDialog}
                >
                  <Text style={styles.doneText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CompareFaces;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'white',
    width: width,
  },
  wrapper: {
    margin: 50,
    marginBottom: 40,
    marginTop: 20,
  },
  headingText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#4327B2',
    padding: 12,
    marginTop: 30,
    borderRadius: 5,
    width: 200,
    alignSelf: 'flex-end',
    marginRight: 50,
  },
  uploadText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  loader: {
    marginTop: 5,
  },
  loaderText: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 20,
  },
  doneButton: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 9,
    borderColor: '#4327B2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 30,
  },
  doneText: {
    color: '#4327B2',
    fontSize: 20,
    fontWeight: 500,
  },
  successText: {
    fontWeight: 700,
    fontSize: 20,
    marginTop: 12,
    marginBottom: 14,
    textAlign: 'center',
  },
  successContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  bold: {
    fontWeight: 'bold',
  },
  resultText: {
    textAlign: 'center',
    padding: 2,
  },
});

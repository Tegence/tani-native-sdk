import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import WebCamComponent from './utils/Webcam';
import { CameraView } from 'expo-camera';
import axios from './api/useAxios';
import type { TaniAuthTypes } from '../types/TaniAuthTypes';

const { width } = Dimensions.get('window'); // Get screen width

type RNFile = {
  uri: string;
  type: string;
  name: string;
};

const EnrollUser: React.FC<TaniAuthTypes> = ({ authInstance, onSuccess }) => {
  const inputRef = useRef<TextInput>(null);
  const [inputName, setInputName] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<RNFile | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  console.log(inputName);

  const enrollUser = async () => {
    setIsLoading(true);
    setOpenDialog(true);
    try {
      if (imageFile && inputName) {
        setIsLoading(true);
        const file = imageFile;
        const formData = new FormData();
        formData.append('person_name', inputName);
        const group_id = authInstance.getGroupId();
        if (group_id) {
          formData.append('group_id', group_id);
        }
        formData.append('image', file as any);

        const response = await axios.post(
          '/persons/create-with-image',
          formData,
          {
            headers: authInstance.getHeaders(),
          }
        );
        setIsLoading(false);
        setUploadCompleted(true);
        setOpenDialog(true);
        onSuccess(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setUploadError(true);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setImageSrc(null);
    setImageFile(null);
    setCameraOpen(false);
    setOpenDialog(false);
    setInputName('');
    setUploadCompleted(false);
    setUploadError(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <View style={styles.container}>
      {!cameraOpen && (
        <View style={styles.wrapper}>
          <Text style={styles.headingText}>Create a new user</Text>
          <View>
            <Text style={styles.name}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Customer's Name"
              ref={inputRef}
              value={inputName}
              onChangeText={setInputName}
            />
          </View>
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
        <TouchableOpacity style={styles.uploadButton} onPress={enrollUser}>
          <Text style={styles.uploadText}>Upload Image</Text>
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
                <Text style={styles.loaderText}>Uploading Image</Text>
              </View>
            )}

            {/* Close Modal Button */}
            {uploadCompleted && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Person added successfully
                </Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCloseDialog}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            {uploadError && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>Unable To Add Person</Text>
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

export default EnrollUser;

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
  name: {
    color: 'black',
    fontSize: 16,
  },
  input: {
    padding: 12,
    borderWidth: 0.5,
    borderRadius: 5,
    fontSize: 16,
    marginTop: 5,
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
  },
  successContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
});

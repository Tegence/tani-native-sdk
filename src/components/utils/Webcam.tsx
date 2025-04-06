import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { WebCamProps } from '../../types/WebcamTypes';
import Modal from 'react-native-modal';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { compressToFileSize } from '../lib/helpers';

const { width } = Dimensions.get('window'); // Get screen width
const CAMERA_HEIGHT = (width * 16) / 9; // Maintain 16:9 aspect ratio

const WebCamComponent = forwardRef(
  (
    {
      setImageFile,
      setImageSrc,
      imageSrc,
      cameraOpen,
      setCameraOpen,
      buttonTitle,
    }: WebCamProps,
    ref
  ) => {
    const [permission] = useCameraPermissions();
    // const [cameraOpen, setCameraOpen] = useState(false);
    const cameraRef = useRef<CameraView | null>(null);

    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
      if (!permission) {
        //requestPermission(); // Request permission when component mounts
      }
    }, [permission]);

    const handleOpenCamera = () => {
      setModalVisible(false);
      setCameraOpen(true);
    };

    const takePicture = async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setImageSrc(photo.uri);
          const file = {
            uri: photo.uri,
            type: 'image/jpeg', // Adjust based on format
            name: `photo_${Date.now()}.jpg`,
          };
          setImageFile(file);
          setCameraOpen(false);
        }
      }
    };

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        //allowsEditing: true,
        // aspect: [4, 3],
        quality: 1,
      });

      //console.log(result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        if (selectedImage?.uri) {
          setImageSrc(selectedImage?.uri);
          const file = {
            uri: selectedImage?.uri,
            type: selectedImage.type ?? 'image',
            name: `photo_${Date.now()}.jpg`,
            fileSize: selectedImage?.fileSize,
          };
          const compressedFile = await compressToFileSize(
            selectedImage?.uri,
            file
          );
          //console.log(compressedFile)
          if (compressedFile) setImageFile(compressedFile);
        }
      }
      setModalVisible(false);
    };

    useImperativeHandle(ref, () => ({
      close_camera: () => {
        setCameraOpen(false);
        setImageSrc(null);
      },
    }));

    if (!permission) {
      return <Text>Requesting camera permission...</Text>;
    }
    if (!permission.granted) {
      return <Text>No access to camera</Text>;
    }

    return (
      <View style={styles.container}>
        {cameraOpen ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="front">
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.text}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCameraOpen(false)}
              >
                <Text style={styles.text}>Close Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={styles.imageBox}>
            {imageSrc ? (
              <View>
                {imageSrc && (
                  <Image source={{ uri: imageSrc }} style={styles.image} />
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setImageSrc(null)}
                >
                  <FontAwesome name="times-circle" size={28} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraBoxContainer}>
                <View>
                  <Text style={styles.cameraText}>Add Image</Text>
                  <View style={styles.cameraBox}>
                    <Ionicons name="image-outline" size={70} color="#A497DA" />
                    <Text style={styles.cameraBoxText}>Click to add image</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.openCameraButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.openCameraText}>{buttonTitle}</Text>
                </TouchableOpacity>
                <View style={styles.taniVector}>
                  <Text style={styles.vectorText}>Powered by</Text>
                  <Image
                    source={require('./images/tani_vector.png')}
                    style={styles.taniVectorImage}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
          useNativeDriver={true}
        >
          <View style={styles.modalContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.modalBoldText}>Add Image</Text>
                <Text style={styles.modalText}>
                  Select an option for identity verification.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome5 name="times" size={20} color="#000000EB" />
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.actionBox} onPress={pickImage}>
                <FontAwesome name="picture-o" size={32} color="#4327B2" />
                <View>
                  <Text style={styles.upperText}>Upload photo</Text>
                  <Text style={styles.lowerText}>
                    Select a picture from your phone storage
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBox}
                onPress={handleOpenCamera}
              >
                <MaterialIcons name="photo-camera" size={32} color="#4327B2" />
                <View>
                  <Text style={styles.upperText}>Take a picture</Text>
                  <Text style={styles.lowerText}>
                    Take a picture using your phone camera
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

export default WebCamComponent;

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: width,
  },
  camera: { width: width, height: CAMERA_HEIGHT }, // 16:9 aspect ratio
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#4327B2',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  text: { color: 'white', fontSize: 16 },
  image: { width: 300, height: 300, marginTop: 20, borderRadius: 8 },
  openCameraButton: {
    backgroundColor: '#4327B2',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
  },
  openCameraText: { color: 'white', fontSize: 16, textAlign: 'center' },
  imageBox: {
    position: 'relative',
  },
  cancelButton: {
    borderRadius: '100%',
    position: 'absolute',
    top: 30,
    right: 10,
  },
  cameraBoxContainer: {
    backgroundColor: '#F8F7FD',
    borderRadius: 10,
    padding: 18,
    width: width - 80,
  },
  cameraBox: {
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 300,
  },
  cameraBoxText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 15,
  },
  modalBoldText: {
    fontWeight: 600,
    fontSize: 18,
    color: '#000000EB',
    marginBottom: 6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    height: '40%', // Half of the screen
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    //alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    fontWeight: 400,
    color: '#6B7280',
    marginBottom: 10,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0000000A',
    marginBottom: 8,
  },
  actionBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F2F4F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  upperText: {
    fontWeight: 600,
    color: 'black',
    fontSize: 14,
    marginBottom: 4,
  },
  lowerText: {
    fontWeight: 400,
    fontSize: 12,
    color: '#6B7280',
  },
  taniVector: {
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  vectorText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: 400,
  },
  taniVectorImage: {
    width: 42.9,
    height: 14,
  },
});

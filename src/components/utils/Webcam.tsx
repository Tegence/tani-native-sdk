import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Feather from '@expo/vector-icons/Feather';
import type { WebCamProps } from '../../types/WebcamTypes';

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
    }: WebCamProps,
    ref
  ) => {
    const [permission] = useCameraPermissions();
    // const [cameraOpen, setCameraOpen] = useState(false);
    const cameraRef = useRef<CameraView | null>(null);

    useEffect(() => {
      if (!permission) {
        //requestPermission(); // Request permission when component mounts
      }
    }, [permission]);

    const takePicture = async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        //setCapturedPhoto(photo.uri);
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
          <View>
            {imageSrc ? (
              <View>
                {imageSrc && (
                  <Image source={{ uri: imageSrc }} style={styles.image} />
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setImageSrc(null)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View>
                  <Text style={styles.cameraText}>Verify Photo</Text>
                  <View style={styles.cameraBox}>
                    <Feather name="camera" size={70} color="#A497DA" />
                    <Text style={styles.cameraBoxText}>
                      Click on Open Camera to capture image
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.openCameraButton}
                  onPress={() => setCameraOpen(true)}
                >
                  <Text style={styles.openCameraText}>Open Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

export default WebCamComponent;

const styles = StyleSheet.create({
  container: {
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
  image: { width: 300, height: 300, marginTop: 20, borderRadius: 10 },
  openCameraButton: {
    backgroundColor: '#4327B2',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
  },
  openCameraText: { color: 'white', fontSize: 16, textAlign: 'center' },
  cancelButton: {
    backgroundColor: 'white',
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4327B2',
    width: 100,
  },
  cancelText: {
    color: '#4327B2',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraBox: {
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: width - 80,
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
});

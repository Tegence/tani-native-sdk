/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Entypo from '@expo/vector-icons/Entypo';
import type { VidWebCamProps } from '../../types/WebcamTypes';

const FRAME_INTERVAL = 200;
const WS_URL =
  'wss://tani-face-model-77573755128.us-central1.run.app/real-time-liveliness-detection';
const MAX_RECONNECT_ATTEMPTS = 4;
const { width } = Dimensions.get('window');

const VidWebCam = ({
  setMessage,
  error,
  setError,
  setOpenDialog,
  setResult,
  onSuccess,
}: VidWebCamProps) => {
  // State management
  const [permission, requestPermission] = useCameraPermissions();
  const [displayCamera, setDisplayCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [instructions, setInstructions] = useState(
    'Align your face in the frame'
  );

  // Refs
  const cameraRef = useRef<CameraView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);
  const isCapturingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);

  const startFrameCapture = () => {
    stopFrameCapture();
    frameIntervalRef.current = setInterval(() => {
      if (!isCapturingRef.current) captureFrame();
    }, FRAME_INTERVAL);
  };

  const stopFrameCapture = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const captureFrame = async () => {
    if (!isMountedRef.current || isCapturingRef.current) return;
    isCapturingRef.current = true;
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        //console.log('Skipping frame - WebSocket not ready');
        return;
      }

      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
        skipProcessing: true,
        exif: false,
        //format: 'jpeg', // Explicitly set format
      });

      if (wsRef.current?.readyState === WebSocket.OPEN && photo?.base64) {
        // const message = {
        //   frame: photo.base64, // Send raw base64 without data URI prefix
        //   timestamp: Date.now(),
        //   format: 'jpeg'
        // };
        const frame = `data:image/jpeg;base64,${photo.base64}`;
        //console.log(frame?.slice(0,50))

        wsRef.current.send(JSON.stringify({ frame }));
        //console.log("message sent")
      }
    } catch (err) {
      console.error('Error capturing frame:', err);
      if (err instanceof Error) {
        setError(`Capture error: ${err.message}`);
      }
    } finally {
      isCapturingRef.current = false;
    }
  };

  const attemptReconnect = useCallback(() => {
    if (!isMountedRef.current || !displayCamera) return;

    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttemptsRef.current++;
      const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000);

      //console.log(`Reconnecting attempt #${reconnectAttemptsRef.current} in ${delay}ms`);

      setTimeout(() => {
        if (isMountedRef.current && displayCamera) initWebSocket();
      }, delay);
    } else {
      handleError('Max reconnection attempts reached');
    }
  }, []);

  const handleSuccess = () => {
    cleanup();
  };

  const handleError = (errorMessage: string) => {
    setIsLoading(false);
    //setConnectionStatus('error');
    setError(errorMessage);
    stopFrameCapture();
  };

  const initWebSocket = useCallback(() => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    //setConnectionStatus('connecting');
    setError(null);
    reconnectAttemptsRef.current = 0;

    try {
      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.close(4000, 'Connection timeout');
        }
      }, 10000);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        if (!isMountedRef.current) return;
        reconnectAttemptsRef.current = 0;
        setIsLoading(false);
        //setConnectionStatus('connected');
        //console.log('WebSocket connection established');
        startFrameCapture();

        // Send initial handshake if needed
        socket.send(
          JSON.stringify({
            type: 'handshake',
            platform: Platform.OS,
            version: '1.0',
          })
        );
      };

      socket.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const message = JSON.parse(event.data);
          //console.log('Received message:', message);

          if (message.error && setError) {
            setError(message.error);
            return;
          }

          if (message.instruction) {
            setInstructions(message.instruction);
          }

          if (message.results) {
            handleSuccess();
            setInstructions('Liveness detection completed!');
            setResult(message.results);
            onSuccess(message.results);
            setOpenDialog(true);
            setMessage('Liveness detection completed!');
            setDisplayCamera(false);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
          setError('Invalid server response');
        }
      };

      socket.onerror = (err) => {
        clearTimeout(connectionTimeout);
        if (!isMountedRef.current) return;
        console.error('WebSocket error:', error);
        let errorMsg = 'Connection error';

        if (Platform.OS === 'ios' && err.message.includes('-9806')) {
          errorMsg = 'Secure connection failed. Please check your network.';
        } else if (err.message.includes('TIMED_OUT')) {
          errorMsg = 'Connection timed out';
        }

        setError(errorMsg);
        attemptReconnect();
      };

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        if (!isMountedRef.current) return;
        //console.log('WebSocket closed:', event.code, event.reason);

        if (event.code === 4000) {
          setError('Connection timed out');
        }

        //setConnectionStatus('disconnected');
        stopFrameCapture();

        if (event.code !== 1000) {
          attemptReconnect();
        }
      };
    } catch (err) {
      console.error('WebSocket initialization error:', err);
      setError('Failed to initialize connection');
      attemptReconnect();
    }
  }, [
    isMountedRef,
    setIsLoading,
    setError,
    reconnectAttemptsRef,
    stopFrameCapture,
    attemptReconnect,
  ]);

  const cleanup = useCallback(() => {
    stopFrameCapture();
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (
          [WebSocket.OPEN, WebSocket.CONNECTING].includes(
            wsRef.current.readyState
          )
        ) {
          wsRef.current.close(1000, 'Component unmounting');
        }
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      } finally {
        wsRef.current = null;
      }
    }
  }, []);

  // Component lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!displayCamera) return;
    initWebSocket();
    return () => cleanup();
  }, [displayCamera, initWebSocket, cleanup]);

  const toggleCamera = async () => {
    if (displayCamera) {
      setDisplayCamera(false);
      cleanup();
      return;
    }

    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Camera access is needed for liveness detection'
        );
        return;
      }
    }

    setDisplayCamera(true);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Camera permission not granted</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liveness Check</Text>
      <Text style={styles.description}>
        {displayCamera
          ? 'Follow the on-screen instructions'
          : 'Authenticate your users'}
      </Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {displayCamera ? (
        <View style={styles.cameraSection}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            enableTorch={false}
          />

          <View style={styles.statusContainer}>
            {isLoading && <ActivityIndicator size="small" color="#4327B2" />}
            <Text style={styles.instructions}>{instructions}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={toggleCamera}
          >
            <Text style={styles.buttonText}>Close Liveness</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholderWrapper}>
          <Text style={styles.verifyText}>Verify Identity</Text>
          <View style={styles.placeholder}>
            <Entypo name="video-camera" size={80} color="#4327B2" />
            <Text style={styles.prompt}>Record yourself to check liveness</Text>
            <TouchableOpacity
              style={[styles.button, styles.openButton]}
              onPress={toggleCamera}
            >
              <Text style={styles.buttonText}>Start Liveness Check</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    //alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFCFD',
    width: width,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 20,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  cameraSection: {
    width: '100%',
    alignItems: 'center',
  },
  camera: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#666',
  },
  instructions: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#4327B2',
  },
  openButton: {
    backgroundColor: '#4327B2',
    width: '100%',
  },
  placeholderWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#0000000A',
    backgroundColor: 'white',
    padding: 20,
  },
  placeholder: {
    alignItems: 'center',
    padding: 35,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    width: '100%',
    marginTop: 15,
  },
  prompt: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  verifyText: {
    fontWeight: 600,
    color: '#000000EB',
    fontSize: 15,
  },
});

export default VidWebCam;

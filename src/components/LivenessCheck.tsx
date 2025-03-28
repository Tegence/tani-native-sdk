import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import VidWebCam from './utils/VidWebcam';
import type { LivenessCheckProps } from '../types/TaniAuthTypes';
import type { LivenessDetection } from '../types/WebcamTypes';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const LivenessCheck: React.FC<LivenessCheckProps> = ({ onSuccess }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LivenessDetection | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
    setResult(null);
    setMessage(null);
  };

  return (
    <View>
      <VidWebCam
        setMessage={setMessage}
        error={error}
        setError={setError}
        setOpenDialog={setOpenDialog}
        setResult={setResult}
        onSuccess={onSuccess}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={openDialog}
        onRequestClose={() => setOpenDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {message && (
              <View style={styles.successContainer}>
                <View style={styles.resultHeading}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={66}
                    color="#64C155"
                  />
                  <Text style={styles.successText}>{message}</Text>
                </View>
                <View style={styles.resultWrapper}>
                  <View style={styles.result}>
                    <FontAwesome
                      name="check"
                      size={20}
                      color={result?.blink_detected ? '#64C155' : '#F2F4F7'}
                    />
                    <Text style={styles.resultText}>Eyes Blink</Text>
                  </View>
                  <View style={styles.result}>
                    <FontAwesome
                      name="check"
                      size={20}
                      color={
                        result?.mouth_open_detected ? '#64C155' : '#F2F4F7'
                      }
                    />
                    <Text style={styles.resultText}>Mouth Open</Text>
                  </View>
                  <View style={styles.result}>
                    <FontAwesome
                      name="check"
                      size={20}
                      color={
                        result?.head_movement_detected ? '#64C155' : '#F2F4F7'
                      }
                    />
                    <Text style={styles.resultText}>Head Movement</Text>
                  </View>
                  <View style={styles.result}>
                    <FontAwesome
                      name="check"
                      size={20}
                      color={result?.is_live ? '#64C155' : '#F2F4F7'}
                    />
                    <Text style={styles.resultText}>Live</Text>
                  </View>
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
    paddingTop: 10,
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
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 30,
    backgroundColor: '#4327B2',
  },
  doneText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 500,
  },
  resultHeading: {
    flexDirection: 'column',
    //justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontWeight: 600,
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 400,
    color: '#637381',
  },
  result: {
    flexDirection: 'row',
    //justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  resultWrapper: {
    flexDirection: 'column',
    gap: 6,
  },
});

export default LivenessCheck;

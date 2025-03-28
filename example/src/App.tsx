// import {EnrollUser, FaceRecognition, CompareFaces, LivenessCheck, TaniAuth}  from 'tani-native-sdk';
import { Text, View, StyleSheet } from 'react-native';

const result = 5;

export default function App() {
  // const authInstance = new TaniAuth("ykru2gKctIAmpLETxx0buQ", "d2ea1214-22fd-4512-9844-577bdab9ccd5");
  // const handleSuccess = (result: any) => {
  //   console.log("result",result);
  // };
  // const imageUrl = 'https://res.cloudinary.com/df7ovxux0/image/upload/v1654623190/cld-sample.jpg';

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      {/* <EnrollUser authInstance={authInstance} onSuccess={handleSuccess}/> */}
      {/* <FaceRecognition authInstance={authInstance} onSuccess={handleSuccess}/> */}
      {/* <CompareFaces authInstance={authInstance} onSuccess={handleSuccess} imageUrl={imageUrl}/> */}
      {/* <LivenessCheck onSuccess={handleSuccess}/> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

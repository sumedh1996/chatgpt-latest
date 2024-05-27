import AnimatedIntro from "@/components/AnimatedIntro";
import BottomSheet from "@/components/BottomSheet";
import {  View } from "react-native";


export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        
      }}
    >
     <AnimatedIntro />
     <BottomSheet />
    </View>
  );
}

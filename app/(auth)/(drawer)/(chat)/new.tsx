import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import HeaderDropDown from "@/components/HeaderDropdown";
import MessageInput from "@/components/MessageInput";
import { Message, Role } from "@/utils/interfaces";
import MessageIdeas from "@/components/MessageIdeas";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { useMMKVString } from 'react-native-mmkv';
import { keyStorage, storage } from "@/utils/Storage";
import OpenAI from 'react-native-openai';

const Home = () => {
  const [height, setHeight] = useState(0);
 
  const [messages, setMessages] = useState<Message[]>([]);
  const [key, setKey] = useMMKVString('apikey', keyStorage);
  const [organization, setOrganization] = useMMKVString('org', keyStorage);
  const [gptVersion, setGptVersion] = useMMKVString('gptVersion', storage);
  console.log(key, organization, "Hello")
  if (!key || key === '' || !organization || organization === '') {
    return <Redirect href={'/(auth)/(modal)/settings'} />;
  }

  const openAI = useMemo(
    () =>
      new OpenAI({
        apiKey: key,
        organization,
      }),
    []
  );


  useEffect(() => {
    console.log("11111")
    const handleNewMessage = (payload: any) => {
      console.log("Message Called")
      setMessages((messages) => {
        const newMessage = payload.choices[0]?.delta.content;
        if (newMessage) {
          messages[messages.length - 1].content += newMessage;
          return [...messages];
        }
        if (payload.choices[0]?.finishReason) {
          // save the last message

          // addMessage(db, parseInt(chatIdRef.current), {
          //   content: messages[messages.length - 1].content,
          //   role: Role.Bot,
          // });
        }
        return messages;
      });
    };

    openAI.chat.addListener('onChatMessageReceived', (payload) => {
      console.log(payload)
    });

    return () => {
      openAI.chat.removeListener('onChatMessageReceived');
    };
  }, [openAI]);



  const getCompletion = async (message: string) => {
    if (messages.length === 0) {
      // addChat(db, text).then((res) => {
      //   const chatID = res.lastInsertRowId;
      //   setChatId(chatID.toString());
      //   addMessage(db, chatID, { content: text, role: Role.User });
      // });
    }

    setMessages([...messages, { role: Role.User, content: message }, { role: Role.Bot, content: '' }]);
    messages.push();
    console.log("hellooo111", message)
    try{
      openAI.chat.stream({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        model: gptVersion == '4' ? 'gpt-4' : 'gpt-3.5-turbo',
      });
    }catch(err){
      console.log(err)
    }
  };



  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height / 2);
  };

  // TODO:Height adustment when keyboard is open

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              title="ChatGPT"
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
              onSelect={setGptVersion}
              selected={gptVersion}
            />
          ),
        }}
      />
      <View style={styles.page} onLayout={onLayout}>
        {messages.length == 0 && (
          <View style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}>
            <Image
              source={require("@/assets/images/logo-white.png")}
              style={styles.image}
            />
          </View>
        )}
        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 150 }}
          keyboardDismissMode="on-drag"
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={70}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
        }}
      >
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={(data) => getCompletion(data)} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "cover",
  },
  page: {
    flex: 1,
  },
});

export default Home;

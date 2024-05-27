import { View, Text, Button } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo'

const Home = () => {
    const {signOut} = useAuth()
  return (
    <View style={{marginTop: 40}}>
      <Button title="Logout" onPress={() => signOut()} />
    </View>
  )
}

export default Home
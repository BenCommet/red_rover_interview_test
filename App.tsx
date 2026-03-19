import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
// I decided to use the set function from lodash as it is what I would use for safely accessing nested
// Javascript object calls in a dynamic way in a production setting.
import {set} from 'lodash'

export default function App() {
  const [inputText, setInputText] = useState("")
  const [parsedText, setParsedText] = useState("");

  function parseFieldStringAlphabetical(isAlphabetical = false){
    let currentSubstring = "";
    let displayStringObject = {};
    let currentObjectPath = '';
    // The trailing spaces after the commas aren't useful for us
    let inputTextNoSpace = inputText.replaceAll(', ', ',');
    for(let i = 0; i < inputTextNoSpace.length; i++){
      const currChar = inputTextNoSpace[i];
      switch(currChar){
        case '(':
          if(currentSubstring){
            if(currentObjectPath){
              // If we are opening a new parentheses we need to add the current string to our path in order to be able
              // to nest our objects to the correct parents
              currentObjectPath += '.'+ currentSubstring;
            }
            else{
              currentObjectPath = currentSubstring;
            }
            set(displayStringObject, currentObjectPath, currentSubstring);
            currentSubstring = '';
          }
          break;
        case ')':
          if(currentSubstring){
            if(currentObjectPath){
              set(displayStringObject, currentObjectPath + '.' + currentSubstring, currentSubstring)
              currentSubstring = '';
            }
            else{
              set(displayStringObject, currentSubstring, currentSubstring)
              currentSubstring = '';
            }
          }

          // remove the most recently added element from our path string
          let splitPath = currentObjectPath.split('.');
          splitPath.pop();
          currentObjectPath = splitPath.join('.')
          break;
        case ',':
          if(!currentSubstring){
            break;
          }
          if(currentObjectPath){
            set(displayStringObject, currentObjectPath + '.' + currentSubstring, currentSubstring)
            currentSubstring = '';
          }
          else{
            set(displayStringObject, currentSubstring, currentSubstring)
            currentSubstring = '';
          }
          break;
        default:
          currentSubstring += currChar;
          break;
      }
    }
    if(currentSubstring){
      set(displayStringObject, currentObjectPath + '.' + currentSubstring, currentSubstring)
    }
    if(isAlphabetical){
    let sortedObjectKeys = sortObjectKeys(displayStringObject);
    setParsedText(buildDisplayStringFromObject(sortedObjectKeys, '', 1));
    }
    else{
      setParsedText(buildDisplayStringFromObject(displayStringObject, '', 1));

    }
  }

function buildDisplayStringFromObject(obj: object, displayString: string, depth: number = 1){
  const keys = Object.keys(obj) as Array<keyof typeof obj>;
  for(var i = 0; i < keys.length; i++){
    displayString += '  '.repeat(depth) + '- ' + keys[i] + '\n'
    if(typeof obj[keys[i]] === 'object' && obj[keys[i]] !== null){
      displayString = buildDisplayStringFromObject(obj[keys[i]], displayString, depth + 1)
    }
  }
  return displayString;

}

function sortObjectKeys(obj: Object) {
if (obj !== null && typeof obj === 'object') {
  const keys = Object.keys(obj) as Array<keyof typeof obj>;
    return keys
      .sort()
      .reduce((accumulator: Record<string, any>, key) => {
        accumulator[key] = sortObjectKeys(obj[key]);
        return accumulator;
      }, {});
  }
  else{
    return {};
  }
}

function handleUnsortedParse(){
  parseFieldStringAlphabetical(false)
}

function handleAlphabeticalParse(){
  parseFieldStringAlphabetical(true)
}


  return (
    <View style={styles.container}>
      <TextInput style={styles.input} onChangeText={setInputText} value={inputText} placeholder="Type your parentheses here!" />
      <View style={styles.buttonContainer}>
        <Button onPress={handleUnsortedParse} title='Parse Text' />
        <Button onPress={handleAlphabeticalParse} title='Parse Text Alphabetically' />
      </View>
      <Text>{parsedText}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 10,
    rowGap: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    columnGap: 30
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 16
  }
});

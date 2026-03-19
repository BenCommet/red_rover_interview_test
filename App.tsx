import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import {get, set} from 'lodash'

export default function App() {
  const [inputText, setInputText] = useState("(id, name, email, type(id, name, customFields(c1, c2, c3)), externalId)")
  const [parsedText, setParsedText] = useState("");

  // function parseFieldString(isAlphabetical = false){
  //   let displayString = "";
  //   let currentSubstring = "";
  //   let currentIndentation = 0;
  //   let indentationToRemove = 0;
  //   // The trailing spaces after the commas aren't useful for us so they can be removed
  //   let inputTextNoSpace = inputText.replaceAll(', ', ',');
  //   for(let i = 0; i < inputTextNoSpace.length; i++){
  //     const currChar = inputTextNoSpace[i];
  //     switch(currChar){
  //       case '(':
  //         currentSubstring = addCurrentSubstring(currentSubstring, currentIndentation)
  //         displayString += currentSubstring;
  //         currentSubstring = '';
  //         currentIndentation -= indentationToRemove;
  //         indentationToRemove = 0;
  //         currentIndentation ++;
  //         break;
  //       case ')':
  //         indentationToRemove ++;
  //         break;
  //       case ',':
  //         currentSubstring = addCurrentSubstring(currentSubstring, currentIndentation)
  //         displayString += currentSubstring;
  //         currentSubstring = '';
  //         currentIndentation -= indentationToRemove;
  //         indentationToRemove = 0;
  //         break;
  //       default:
  //         currentSubstring += currChar;
  //         break;
  //     }
  //   }
  //   if(currentSubstring){
  //     currentSubstring = addCurrentSubstring(currentSubstring, currentIndentation)
  //     displayString += currentSubstring;
  //   }
  //   setParsedText(displayString);
  //   return displayString;
  // }

  // function addCurrentSubstring(currentSubstring: string, currentIndentation: number,){
  //   if(currentSubstring === ''){
  //     return '';
  //   }
  //   currentSubstring = "- " + currentSubstring;
  //   for(var j = 0; j < currentIndentation; j++){
  //     currentSubstring = "  " + currentSubstring;
  //   }
  //   currentSubstring += '\n';
  //   return currentSubstring;
  // }

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

          // remove the most recently added element 
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
    console.log(displayString)
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
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
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
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25
  },
  buttonContainer: {
    flexDirection: 'row',
    columnGap: 30
  },
  input: {
    borderWidth: 1
  }
});

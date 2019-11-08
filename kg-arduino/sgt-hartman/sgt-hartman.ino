#include "SD.h"
#define SD_ChipSelectPin 10
#include "TMRpcm.h"
#include "SPI.h"
#include <IRremote.h>
#include <IRremoteInt.h>
TMRpcm tmrpcm;
//IR stuff
int RECV_PIN = 8;
IRrecv receiver(RECV_PIN);
decode_results results;

boolean isPlaying = false;
int volume = 20;
const int red = 7;
const int green = 6;
int vol = 5;

void setup()
{
  tmrpcm.speakerPin=9;
  receiver.enableIRIn();
  Serial.begin(9600);
  if(!SD.begin(SD_ChipSelectPin))
  {
    Serial.println("SD fail");
    return;
  }
}

void loop() {
  
  static unsigned long timer = millis();
  if(receiver.decode(&results)){
    Serial.println(results.value, HEX);

    switch (results.value){
      case 0xFF6897: // 0
        digitalWrite(green, HIGH);
        tmrpcm.play("ugly.wav");
        break;
      case 0xFF30CF: // 1
        digitalWrite(green, HIGH);
        tmrpcm.play("neck.wav");
        break;
      case 0xFF18E7: // 2
        digitalWrite(green, HIGH);
        tmrpcm.play("numnuts.wav");
        break;
      case 0xFF7A85: // 3
        digitalWrite(green, HIGH);
        tmrpcm.play("no_sh.wav");
        break;
      case 0xFF10EF: // 4
        digitalWrite(green, HIGH);
        tmrpcm.play("vomit.wav");
        break;
      case 0xFF38C7: // 5
        digitalWrite(green, HIGH);
        tmrpcm.play("sister.wav");
        break;
      case 0xFF5AA5: // 6
        digitalWrite(green, HIGH);
        tmrpcm.play("golfball.wav");
        break;
      case 0xFF42BD: // 7
        digitalWrite(green, HIGH);
        tmrpcm.play("royalty.wav");
        break;
      case 0xFF4AB5: // 8 
        digitalWrite(green, HIGH);
        tmrpcm.play("stacked.wav");
        break;
      case 0xFF52AD: // 9
        digitalWrite(green, HIGH);
        tmrpcm.play("fatbody.wav");
        break;
      case 0xFF629D: // vol +
        if(vol == 7){
          vol = vol;
        }
        else {
          vol = vol + 1;
        }
        tmrpcm.setVolume(vol);
        break;
      case 0xFFA857: // vol -
        if(vol == 0){
          vol = vol;
        }
        else {
          vol = vol - 1;
        }
        tmrpcm.setVolume(vol);
        break;
      default:
        digitalWrite(green, LOW);
        Serial.println(results.value, HEX);
    }
    receiver.resume();
  }
}
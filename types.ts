export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export enum Language {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Japanese = 'Japanese',
  Chinese = 'Chinese',
  Hindi = 'Hindi',
  Portuguese = 'Portuguese'
}

export interface LiveConfig {
  voiceName: VoiceName;
  language: Language;
}

export interface AudioVolumeState {
  inputVolume: number;
  outputVolume: number;
}

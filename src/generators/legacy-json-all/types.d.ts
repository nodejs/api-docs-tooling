import {
  MiscSection,
  Section,
  SignatureSection,
  ModuleSection,
} from '../legacy-json/types';

export interface Output {
  miscs: Array<MiscSection>;
  modules: Array<Section>;
  classes: Array<SignatureSection>;
  globals: Array<ModuleSection | { type: 'global' }>;
  methods: Array<SignatureSection>;
}

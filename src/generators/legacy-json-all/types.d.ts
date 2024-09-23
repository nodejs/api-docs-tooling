import { MiscSection, Section, SignatureSection } from '../legacy-json/types';

export interface Output {
  miscs: MiscSection[];
  modules: Section[];
  classes: SignatureSection[];
  globals: (ModuleSection | { type: 'global' })[];
  methods: SignatureSection[];
}
